import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    console.log('Admin me request - Token exists:', !!token);
    console.log('JWT_SECRET configured:', !!JWT_SECRET);
    
    if (!token) {
      console.log('No admin token found in cookies for /me endpoint');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Admin /me token verified for:', decoded.email);
    } catch (jwtError) {
      console.error('Admin /me JWT verification failed:', jwtError.message);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Connect to database and find admin
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      console.log('Admin not found or inactive for ID:', decoded.adminId);
      return NextResponse.json(
        { error: 'Admin not found or inactive' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}