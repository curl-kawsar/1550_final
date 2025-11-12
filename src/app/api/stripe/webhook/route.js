import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import CouponUsage from '@/models/CouponUsage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout session completed:', session.id);
    console.log('Session metadata:', session.metadata);
    
    const studentId = session.metadata?.studentId;
    if (!studentId) {
      console.error('No student ID in checkout session metadata');
      return;
    }

    // Get the payment intent to get more details
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    
    const updateData = {
      paymentStatus: 'succeeded',
      hasPaidSpecialOffer: true,
      paymentDate: new Date(),
      paymentAmount: session.amount_total / 100, // Convert from cents to dollars
      stripePaymentIntentId: session.payment_intent
    };

    console.log(`Updating student ${studentId} with data:`, updateData);
    
    const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });
    
    // Update coupon usage status if applicable
    if (session.metadata?.couponId) {
      await CouponUsage.findOneAndUpdate(
        { 
          stripeSessionId: session.id,
          paymentStatus: 'pending' 
        },
        { 
          paymentStatus: 'paid' 
        }
      );
      console.log(`Updated coupon usage status to 'paid' for session: ${session.id}`);
    }
    
    console.log(`Payment completed for student: ${studentId}`, updatedStudent?.hasPaidSpecialOffer);
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const studentId = paymentIntent.metadata?.studentId;
    if (!studentId) {
      console.error('No student ID in payment intent metadata');
      return;
    }

    const updateData = {
      paymentStatus: 'succeeded',
      hasPaidSpecialOffer: true,
      paymentDate: new Date(),
      paymentAmount: paymentIntent.amount / 100, // Convert from cents to dollars
      stripePaymentIntentId: paymentIntent.id
    };

    await Student.findByIdAndUpdate(studentId, updateData);
    
    // Update coupon usage status if applicable
    if (paymentIntent.metadata?.couponId) {
      await CouponUsage.findOneAndUpdate(
        { 
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: 'pending' 
        },
        { 
          paymentStatus: 'paid' 
        }
      );
      console.log(`Updated coupon usage status to 'paid' for payment intent: ${paymentIntent.id}`);
    }
    
    console.log(`Payment intent succeeded for student: ${studentId}`);
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const studentId = paymentIntent.metadata?.studentId;
    if (!studentId) {
      console.error('No student ID in payment intent metadata');
      return;
    }

    const updateData = {
      paymentStatus: 'failed'
    };

    await Student.findByIdAndUpdate(studentId, updateData);
    
    // Update coupon usage status if applicable
    if (paymentIntent.metadata?.couponId) {
      await CouponUsage.findOneAndUpdate(
        { 
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: 'pending' 
        },
        { 
          paymentStatus: 'failed' 
        }
      );
      console.log(`Updated coupon usage status to 'failed' for payment intent: ${paymentIntent.id}`);
    }
    
    console.log(`Payment intent failed for student: ${studentId}`);
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    // Handle subscription payments if needed in the future
    console.log('Invoice payment succeeded:', invoice.id);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}
