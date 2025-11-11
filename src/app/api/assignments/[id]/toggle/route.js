import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import jwt from 'jsonwebtoken';

// Toggle assignment active status (Admin only)
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    if (!['admin', 'super-admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // Toggle the isActive status
    assignment.isActive = !assignment.isActive;
    assignment.updatedAt = Date.now();
    
    await assignment.save();
    
    return NextResponse.json({
      message: `Assignment ${assignment.isActive ? 'activated' : 'deactivated'} successfully`,
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        isActive: assignment.isActive,
        status: assignment.status
      }
    });
    
  } catch (error) {
    console.error('Error toggling assignment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
