import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import CouponUsage from '@/models/CouponUsage';
import { verifyStudentToken } from '@/lib/auth';

/**
 * Fallback sync when the user returns from Checkout before the webhook has run, or
 * if webhooks are not configured. Does NOT trust the client: it asks Stripe for a
 * completed special-offer Checkout Session for this student. Configure webhooks in
 * production for coupon usage updates and best reliability; this is a safe backup.
 */
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  try {
    const studentPayload = await verifyStudentToken(request);
    if (!studentPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Student login required' },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(studentPayload.studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.hasPaidSpecialOffer) {
      return NextResponse.json(
        { message: 'Payment already completed', hasPaidSpecialOffer: true, synced: true },
        { status: 200 }
      );
    }

    if (!student.stripeCustomerId) {
      return NextResponse.json(
        {
          synced: false,
          message:
            'No Stripe customer on file yet. Complete the checkout in this browser, then try again.',
        },
        { status: 200 }
      );
    }

    const studentIdStr = String(student._id);
    const sessions = await stripe.checkout.sessions.list({
      customer: student.stripeCustomerId,
      limit: 20,
    });

    const completed = sessions.data.find(
      (s) =>
        s.payment_status === 'paid' &&
        s.status === 'complete' &&
        s.metadata?.type === 'special_offer' &&
        s.metadata?.studentId === studentIdStr
    );

    if (!completed) {
      return NextResponse.json(
        {
          synced: false,
          message:
            'We could not confirm a completed special-offer payment in Stripe yet. The webhook will update you automatically when it arrives, or try refreshing in a few seconds.',
        },
        { status: 200 }
      );
    }

    const amountDollars =
      completed.amount_total != null ? completed.amount_total / 100 : 0;
    const pi = completed.payment_intent
      ? typeof completed.payment_intent === 'string'
        ? completed.payment_intent
        : completed.payment_intent.id
      : student.stripePaymentIntentId;

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      {
        paymentStatus: 'succeeded',
        hasPaidSpecialOffer: true,
        paymentDate: new Date(),
        paymentAmount: amountDollars,
        stripePaymentIntentId: pi,
      },
      { new: true }
    );

    if (completed.metadata?.couponId) {
      await CouponUsage.findOneAndUpdate(
        { stripeSessionId: completed.id, paymentStatus: 'pending' },
        { paymentStatus: 'paid' }
      );
    }

    return NextResponse.json(
      {
        message: 'Payment confirmed via Stripe',
        hasPaidSpecialOffer: updatedStudent.hasPaidSpecialOffer,
        paymentStatus: updatedStudent.paymentStatus,
        paymentAmount: updatedStudent.paymentAmount,
        synced: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in complete-payment (Stripe sync):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
