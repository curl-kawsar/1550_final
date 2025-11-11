import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return NextResponse.json(
        { error: 'No student found with this email' },
        { status: 404 }
      );
    }
    
    // Check if student already has a password
    if (student.password) {
      return NextResponse.json(
        { error: 'Password already set. Please use the login page.' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update student with password
    await Student.findByIdAndUpdate(student._id, {
      password: hashedPassword
    });
    
    console.log('Password set up for student:', email);
    
    return NextResponse.json({
      message: 'Password set up successfully'
    });
    
  } catch (error) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}