import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import DiagnosticTest from '@/models/DiagnosticTest';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

// Get specific diagnostic test (Admin only)
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
    
    const { id } = params;
    
    const diagnosticTest = await DiagnosticTest.findById(id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!diagnosticTest) {
      return NextResponse.json({ error: 'Diagnostic test not found' }, { status: 404 });
    }
    
    // Update enrollment count
    const testDoc = await DiagnosticTest.findById(id);
    await testDoc.updateEnrollmentCount();
    diagnosticTest.currentEnrollment = testDoc.currentEnrollment;
    
    return NextResponse.json({ diagnosticTest });
    
  } catch (error) {
    console.error('Error fetching diagnostic test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update diagnostic test (Admin only)
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
    
    const { id } = params;
    const updates = await request.json();
    
    // Find the diagnostic test
    const diagnosticTest = await DiagnosticTest.findById(id);
    if (!diagnosticTest) {
      return NextResponse.json({ error: 'Diagnostic test not found' }, { status: 404 });
    }
    
    // Check if name is being changed and if it conflicts with existing names
    if (updates.name && updates.name !== diagnosticTest.name) {
      const existingTest = await DiagnosticTest.findOne({ 
        name: updates.name,
        _id: { $ne: id }
      });
      if (existingTest) {
        return NextResponse.json(
          { error: 'A diagnostic test with this name already exists' },
          { status: 409 }
        );
      }
      
      // If name is being changed, we need to update all students using this test
      await Student.updateMany(
        { diagnosticTestDate: diagnosticTest.name },
        { diagnosticTestDate: updates.name }
      );
    }
    
    // Validate date if being updated
    if (updates.date) {
      const testDate = new Date(updates.date);
      if (testDate <= new Date()) {
        return NextResponse.json(
          { error: 'Test date must be in the future' },
          { status: 400 }
        );
      }
      updates.date = testDate;
    }
    
    // Update the diagnostic test
    Object.assign(diagnosticTest, updates);
    await diagnosticTest.save();
    
    // Update enrollment count
    await diagnosticTest.updateEnrollmentCount();
    
    // Populate creator info for response
    await diagnosticTest.populate('createdBy', 'name email');
    
    return NextResponse.json({
      message: 'Diagnostic test updated successfully',
      diagnosticTest: diagnosticTest.toObject({ virtuals: true })
    });
    
  } catch (error) {
    console.error('Error updating diagnostic test:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A diagnostic test with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete diagnostic test (Admin only)
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
    
    const { id } = params;
    
    // Find the diagnostic test
    const diagnosticTest = await DiagnosticTest.findById(id);
    if (!diagnosticTest) {
      return NextResponse.json({ error: 'Diagnostic test not found' }, { status: 404 });
    }
    
    // Check if there are students enrolled in this diagnostic test
    const studentsUsingTest = await Student.countDocuments({ 
      diagnosticTestDate: diagnosticTest.name,
      status: { $ne: 'cancelled' }
    });
    
    if (studentsUsingTest > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete diagnostic test. ${studentsUsingTest} student(s) are currently registered for this test.`,
          studentsCount: studentsUsingTest
        },
        { status: 400 }
      );
    }
    
    // Delete the diagnostic test
    await DiagnosticTest.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Diagnostic test deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting diagnostic test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
