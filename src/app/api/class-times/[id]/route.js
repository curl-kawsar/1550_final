import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import ClassTime from '@/models/ClassTime';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

// Get specific class time (Admin only)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
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
    
    const { id } = await params;
    
    const classTime = await ClassTime.findById(id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!classTime) {
      return NextResponse.json({ error: 'Class time not found' }, { status: 404 });
    }
    
    // Update enrollment count
    const classTimeDoc = await ClassTime.findById(id);
    await classTimeDoc.updateEnrollmentCount();
    classTime.currentEnrollment = classTimeDoc.currentEnrollment;
    
    return NextResponse.json({ classTime });
    
  } catch (error) {
    console.error('Error fetching class time:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update class time (Admin only)
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
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
    
    const { id } = await params;
    const updates = await request.json();
    
    // Find the class time
    const classTime = await ClassTime.findById(id);
    if (!classTime) {
      return NextResponse.json({ error: 'Class time not found' }, { status: 404 });
    }
    
    // Check if name is being changed and if it conflicts with existing names
    if (updates.name && updates.name !== classTime.name) {
      const existingClassTime = await ClassTime.findOne({ 
        name: updates.name,
        _id: { $ne: id }
      });
      if (existingClassTime) {
        return NextResponse.json(
          { error: 'A class time with this name already exists' },
          { status: 409 }
        );
      }
      
      // If name is being changed, we need to update all students using this class time
      await Student.updateMany(
        { classTime: classTime.name },
        { classTime: updates.name }
      );
    }
    
    // Update the class time
    Object.assign(classTime, updates);
    await classTime.save();
    
    // Update enrollment count
    await classTime.updateEnrollmentCount();
    
    // Populate creator info for response
    await classTime.populate('createdBy', 'name email');
    
    return NextResponse.json({
      message: 'Class time updated successfully',
      classTime: classTime.toObject({ virtuals: true })
    });
    
  } catch (error) {
    console.error('Error updating class time:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A class time with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete class time (Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
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
    
    const { id } = await params;
    
    // Find the class time
    const classTime = await ClassTime.findById(id);
    if (!classTime) {
      return NextResponse.json({ error: 'Class time not found' }, { status: 404 });
    }
    
    // Check if there are students enrolled in this class time
    const studentsUsingClassTime = await Student.countDocuments({ 
      classTime: classTime.name,
      status: { $ne: 'cancelled' }
    });
    
    if (studentsUsingClassTime > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete class time. ${studentsUsingClassTime} student(s) are currently enrolled in this class time.`,
          studentsCount: studentsUsingClassTime
        },
        { status: 400 }
      );
    }
    
    // Delete the class time
    await ClassTime.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Class time deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting class time:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
