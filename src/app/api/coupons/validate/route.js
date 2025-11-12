import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

// POST /api/coupons/validate - Validate coupon code (public endpoint)
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { code, planType = 'all', amount = 99 } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Find and validate coupon
    const coupon = await Coupon.findValidCoupon(code, planType, amount);

    if (!coupon) {
      return NextResponse.json(
        { 
          error: 'Invalid coupon code',
          valid: false 
        },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(amount);
    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountPercentage: coupon.discountPercentage,
        minimumAmount: coupon.minimumAmount,
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
        validUntil: coupon.validUntil
      },
      discount: {
        originalAmount: amount,
        discountAmount,
        finalAmount,
        discountPercentage: coupon.discountPercentage,
        isFree: finalAmount === 0
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
