import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import { verifyStudentToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const studentPayload = await verifyStudentToken(request);
    if (!studentPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Student login required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get student information
    const student = await Student.findById(studentPayload.studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (student.hasPaidSpecialOffer) {
      return NextResponse.json(
        { message: 'Payment already completed', hasPaidSpecialOffer: true },
        { status: 200 }
      );
    }

    // For testing: manually complete the payment
    // In production, this should only be done by webhooks
    const updateData = {
      paymentStatus: 'succeeded',
      hasPaidSpecialOffer: true,
      paymentDate: new Date(),
      paymentAmount: 99.00 // Default amount
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentPayload.studentId, 
      updateData, 
      { new: true }
    );

    console.log(`Manual payment completion for student: ${studentPayload.studentId}`);

    return NextResponse.json({
      message: 'Payment completed successfully',
      hasPaidSpecialOffer: updatedStudent.hasPaidSpecialOffer,
      paymentStatus: updatedStudent.paymentStatus
    }, { status: 200 });

  } catch (error) {
    console.error('Error completing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
