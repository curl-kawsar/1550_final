import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import { verifyStudentToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Verify student token
    const studentPayload = await verifyStudentToken(request);
    if (!studentPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Student login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType, couponCode } = body;

    await connectToDatabase();

    // Get student information
    const student = await Student.findById(studentPayload.studentId).lean();
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student has already paid
    if (student.hasPaidSpecialOffer) {
      return NextResponse.json(
        { error: 'You have already purchased the special offer' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = student.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: student.email,
        name: `${student.firstName} ${student.lastName}`,
        metadata: {
          studentId: student._id.toString(),
          registrationCode: student.registrationCode || ''
        }
      });
      stripeCustomerId = customer.id;

      // Update student with Stripe customer ID
      await Student.findByIdAndUpdate(student._id, {
        stripeCustomerId: stripeCustomerId
      });
    }

    // Define pricing and descriptions based on plan type
    let productData, baseAmount;
    
    switch (planType) {
      case 'recordings_only':
        productData = {
          name: 'SAT 1550+ Recordings Only',
          description: 'Access to all recorded SAT preparation sessions with expert strategies and content',
        };
        baseAmount = 9900; // $99.00 in cents
        break;
      case 'office_hours_only':
        productData = {
          name: 'SAT 1550+ Office Hours Only',
          description: 'Weekly office hours access - Mon, Tues, Wed, Thurs 5:30-6:30pm PST',
        };
        baseAmount = 9900; // $99.00 in cents
        break;
      case 'complete':
      default:
        productData = {
          name: 'SAT 1550+ Complete Package',
          description: 'Full access to recordings and office hours - everything included',
        };
        baseAmount = 9900; // $99.00 in cents
        break;
    }

    // Handle coupon validation and discount calculation
    let validCoupon = null;
    let discountAmount = 0;
    let finalAmount = baseAmount;
    
    if (couponCode) {
      // Find and validate coupon
      validCoupon = await Coupon.findValidCoupon(couponCode, planType, baseAmount / 100); // Convert to dollars
      
      if (!validCoupon) {
        return NextResponse.json(
          { error: 'Invalid or expired coupon code' },
          { status: 400 }
        );
      }
      
      // Calculate discount
      discountAmount = validCoupon.calculateDiscount(baseAmount / 100) * 100; // Convert back to cents
      finalAmount = Math.max(0, baseAmount - discountAmount);
      
      console.log('Coupon applied:', {
        code: validCoupon.code,
        discount: validCoupon.discountPercentage + '%',
        originalAmount: baseAmount / 100,
        discountAmount: discountAmount / 100,
        finalAmount: finalAmount / 100
      });
    }

    // Check if this is a 100% discount (free purchase)
    if (finalAmount === 0) {
      // Handle free purchase immediately without Stripe
      await Student.findByIdAndUpdate(student._id, {
        hasPaidSpecialOffer: true,
        paymentStatus: 'succeeded',
        paymentAmount: 0,
        paymentDate: new Date()
      });
      
      // Record coupon usage
      if (validCoupon) {
        const couponUsage = new CouponUsage({
          coupon: validCoupon._id,
          student: student._id,
          couponCode: validCoupon.code,
          planType,
          originalAmount: baseAmount / 100,
          discountAmount: discountAmount / 100,
          finalAmount: 0,
          discountPercentage: validCoupon.discountPercentage,
          paymentStatus: 'free',
          usedAt: new Date()
        });
        
        await Promise.all([
          couponUsage.save(),
          validCoupon.incrementUsage()
        ]);
      }
      
      // Return success URL for free purchase
      return NextResponse.json({
        success: true,
        message: 'Course unlocked! Enjoy your free access.',
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1550plus.com'}/student-dashboard?payment=success&tab=classroom`,
        isFree: true
      });
    }

    // Calculate 2.9% processing fee on the discounted amount
    const processingFee = Math.round(finalAmount * 0.029); // 2.9% fee in cents
    const totalAmount = finalAmount + processingFee;

    // Build line items for Stripe checkout
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            ...productData,
            description: validCoupon 
              ? `${productData.description} (${validCoupon.discountPercentage}% discount applied)`
              : productData.description
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Processing Fee',
            description: '2.9% payment processing fee',
          },
          unit_amount: processingFee,
        },
        quantity: 1,
      }
    ];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1550plus.com'}/student-dashboard?payment=success&tab=classroom`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1550plus.com'}/special-offer?payment=cancelled`,
      metadata: {
        studentId: student._id.toString(),
        type: 'special_offer',
        planType,
        ...(validCoupon && {
          couponId: validCoupon._id.toString(),
          couponCode: validCoupon.code,
          originalAmount: (baseAmount / 100).toString(),
          discountAmount: (discountAmount / 100).toString(),
          discountPercentage: validCoupon.discountPercentage.toString()
        })
      },
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      billing_address_collection: 'auto',
      payment_intent_data: {
        metadata: {
          studentId: student._id.toString(),
          type: 'special_offer',
          planType,
          ...(validCoupon && {
            couponId: validCoupon._id.toString(),
            couponCode: validCoupon.code,
            originalAmount: (baseAmount / 100).toString(),
            discountAmount: (discountAmount / 100).toString(),
            discountPercentage: validCoupon.discountPercentage.toString()
          })
        }
      }
    });

    // Update student with payment intent information
    await Student.findByIdAndUpdate(student._id, {
      stripePaymentIntentId: session.payment_intent,
      paymentStatus: 'processing'
    });

    // Record pending coupon usage for non-free purchases
    if (validCoupon) {
      const couponUsage = new CouponUsage({
        coupon: validCoupon._id,
        student: student._id,
        couponCode: validCoupon.code,
        planType,
        originalAmount: baseAmount / 100,
        discountAmount: discountAmount / 100,
        finalAmount: finalAmount / 100,
        discountPercentage: validCoupon.discountPercentage,
        paymentStatus: 'pending',
        stripePaymentIntentId: session.payment_intent,
        stripeSessionId: session.id,
        usedAt: new Date()
      });
      
      await Promise.all([
        couponUsage.save(),
        validCoupon.incrementUsage()
      ]);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      couponApplied: validCoupon ? {
        code: validCoupon.code,
        discountPercentage: validCoupon.discountPercentage,
        originalAmount: baseAmount / 100,
        discountAmount: discountAmount / 100,
        finalAmount: finalAmount / 100
      } : null
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
