import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase().trim() });

    // Always return success message (security best practice - don't reveal if email exists)
    const successMessage = 'If an account exists with this email, you will receive a password reset link shortly.';

    if (!student) {
      // Return success but don't send email
      return NextResponse.json({
        message: successMessage
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour from now)
    // Use findByIdAndUpdate to avoid triggering validators on other fields
    await Student.findByIdAndUpdate(
      student._id,
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      },
      { runValidators: false } // Skip validation for password reset
    );

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, 'student');

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      // Don't expose error to user
    }

    return NextResponse.json({
      message: successMessage
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

