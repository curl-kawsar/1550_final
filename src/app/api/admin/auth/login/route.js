import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

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
    
    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Create response with CORS headers for VPS compatibility
    const response = NextResponse.json({
      message: 'Login successful',
      token: token, // Include token for localStorage storage
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
    
    // Add CORS headers for VPS compatibility
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', 'http://72.61.117.161:3000');
    
    // Set HTTP-only cookie with VPS-friendly settings
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Disable secure for VPS compatibility
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    };
    
    response.cookies.set('admin-token', token, cookieOptions);
    
    console.log('Admin login successful for:', email);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Cookie set with options:', cookieOptions);
    console.log('Token length:', token.length);
    
    return response;
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}