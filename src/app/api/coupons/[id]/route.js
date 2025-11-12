import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
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

// GET /api/coupons/[id] - Get specific coupon with usage stats
export async function GET(request, { params }) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Get usage statistics
    const usageStats = await CouponUsage.getCouponStats(id);

    // Add computed fields
    const now = new Date();
    const couponWithStats = {
      ...coupon,
      isCurrentlyValid: coupon.isActive && 
                       coupon.validFrom <= now && 
                       coupon.validUntil >= now &&
                       (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit),
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
      usageStats
    };

    return NextResponse.json({ coupon: couponWithStats });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/coupons/[id] - Update coupon
export async function PATCH(request, { params }) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    const body = await request.json();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon code is being changed and if it already exists
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: body.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate discount percentage
    if (body.discountPercentage !== undefined) {
      if (body.discountPercentage < 1 || body.discountPercentage > 100) {
        return NextResponse.json(
          { error: 'Discount percentage must be between 1 and 100' },
          { status: 400 }
        );
      }
    }

    // Validate dates
    if (body.validFrom || body.validUntil) {
      const validFromDate = body.validFrom ? new Date(body.validFrom) : coupon.validFrom;
      const validUntilDate = body.validUntil ? new Date(body.validUntil) : coupon.validUntil;

      if (validFromDate >= validUntilDate) {
        return NextResponse.json(
          { error: 'Valid until date must be after valid from date' },
          { status: 400 }
        );
      }
    }

    // Update fields
    const allowedUpdates = [
      'code', 'name', 'description', 'discountPercentage', 'usageLimit',
      'validFrom', 'validUntil', 'minimumAmount', 'applicablePlans', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'code') {
          coupon[field] = body[field].toUpperCase();
        } else {
          coupon[field] = body[field];
        }
      }
    });

    await coupon.save();
    await coupon.populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Coupon updated successfully',
      coupon
    });

  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    const usageCount = await CouponUsage.countDocuments({ coupon: id });
    if (usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete coupon that has been used. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
