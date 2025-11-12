import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
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

// GET /api/coupons - List all coupons (admin only)
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, inactive, expired

    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const now = new Date();
    if (status === 'active') {
      filter.isActive = true;
      filter.validFrom = { $lte: now };
      filter.validUntil = { $gte: now };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.validUntil = { $lt: now };
    }

    // Get coupons with pagination
    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter)
    ]);

    // Add computed fields
    const couponsWithStatus = coupons.map(coupon => ({
      ...coupon,
      isCurrentlyValid: coupon.isActive && 
                       coupon.validFrom <= now && 
                       coupon.validUntil >= now &&
                       (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit),
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null
    }));

    return NextResponse.json({
      coupons: couponsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon (admin only)
export async function POST(request) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      code,
      name,
      description,
      discountPercentage,
      usageLimit,
      validFrom,
      validUntil,
      minimumAmount,
      applicablePlans,
      isActive
    } = body;

    // Validation
    if (!code || !name || !discountPercentage || !validUntil) {
      return NextResponse.json(
        { error: 'Code, name, discount percentage, and valid until date are required' },
        { status: 400 }
      );
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Validate dates
    const validFromDate = validFrom ? new Date(validFrom) : new Date();
    const validUntilDate = new Date(validUntil);

    if (validFromDate >= validUntilDate) {
      return NextResponse.json(
        { error: 'Valid until date must be after valid from date' },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description: description || '',
      discountPercentage,
      usageLimit: usageLimit || null,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      minimumAmount: minimumAmount || 0,
      applicablePlans: applicablePlans || ['all'],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: admin.id
    });

    await coupon.save();

    // Populate createdBy for response
    await coupon.populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
