import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import CouponUsage from '@/models/CouponUsage';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Helper function to verify admin authentication
async function verifyAdminAuth(request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('admin-token')?.value;
    
    // Fallback: Check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return null;
    }
    
    return {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

// GET /api/coupons/usage - Get coupon usage history (admin only)
export async function GET(request) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const couponId = searchParams.get('couponId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, free, paid, pending, failed

    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    
    if (couponId) {
      filter.coupon = couponId;
    }

    if (search) {
      filter.$or = [
        { couponCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      filter.paymentStatus = status;
    }

    // Get usage records with pagination
    const [usages, total] = await Promise.all([
      CouponUsage.find(filter)
        .populate('coupon', 'code name discountPercentage')
        .populate('student', 'firstName lastName email')
        .sort({ usedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CouponUsage.countDocuments(filter)
    ]);

    // Get overall statistics
    const overallStats = await CouponUsage.getOverallStats();

    return NextResponse.json({
      usages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: overallStats
    });

  } catch (error) {
    console.error('Error fetching coupon usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
