import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

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

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });

    return NextResponse.json({
      exists: !!existingStudent,
      message: existingStudent ? 'This email is already registered' : 'Email is available'
    });

  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}