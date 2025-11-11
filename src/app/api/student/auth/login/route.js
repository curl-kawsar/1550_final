import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if password field exists
    if (!student.password) {
      console.log('Student needs to set up password for email:', email);
      return NextResponse.json(
        { 
          error: 'Password not set up. Please set up your password first.',
          redirectTo: '/student-setup-password',
          email: email
        },
        { status: 428 } // 428 Precondition Required
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        studentId: student._id.toString(),
        email: student.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('student-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    // Return student data (without password)
    const { password: _, ...studentData } = student.toObject();
    
    return NextResponse.json({
      message: 'Login successful',
      student: studentData,
      token: token  // Include token for localStorage storage
    });
    
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}