import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Verify admin token
function verifyAdminToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET - List all admin users
export async function GET(request) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const admins = await Admin.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

// POST - Create new admin user
export async function POST(request) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admin can create new admins
    if (decoded.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Only super admins can create new admin users' },
        { status: 403 }
      );
    }

    await connectDB();

    const { name, email, password, role, isActive } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'admin',
      isActive: isActive !== undefined ? isActive : true
    });

    await newAdmin.save();

    // Remove sensitive data before returning
    const adminResponse = newAdmin.toJSON();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: adminResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

