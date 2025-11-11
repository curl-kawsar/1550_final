import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClassStructure from '@/models/ClassStructure';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Get all class structures (Admin only)
export async function GET(request) {
  try {
    // Verify admin token from cookie or Authorization header
    let adminPayload = await verifyAdminToken(request);
    
    // Fallback to Authorization header for API requests
    if (!adminPayload) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          await connectToDatabase();
          const admin = await Admin.findById(decoded.adminId || decoded.id);
          if (admin && admin.isActive) {
            adminPayload = {
              id: admin._id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            };
          }
        } catch (error) {
          console.error('Bearer token verification error:', error);
        }
      }
    }
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const classStructures = await ClassStructure.find()
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      classStructures
    });
    
  } catch (error) {
    console.error('Error fetching class structures:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new class structure (Admin only)
export async function POST(request) {
  try {
    // Verify admin token from cookie or Authorization header
    let adminPayload = await verifyAdminToken(request);
    
    // Fallback to Authorization header for API requests
    if (!adminPayload) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          await connectToDatabase();
          const admin = await Admin.findById(decoded.adminId || decoded.id);
          if (admin && admin.isActive) {
            adminPayload = {
              id: admin._id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            };
          }
        } catch (error) {
          console.error('Bearer token verification error:', error);
        }
      }
    }
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, overview, description, requiresPayment, sortOrder } = body;

    // Validation
    if (!title || !overview) {
      return NextResponse.json(
        { error: 'Title and overview are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const classStructure = new ClassStructure({
      title: title.trim(),
      overview: overview.trim(),
      description: description?.trim() || '',
      requiresPayment: requiresPayment !== false, // Default to true
      sortOrder: sortOrder || 0,
      createdBy: adminPayload.id
    });

    await classStructure.save();

    // Populate the created structure for response
    const populatedStructure = await ClassStructure.findById(classStructure._id)
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Class structure created successfully',
      classStructure: populatedStructure
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating class structure:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
