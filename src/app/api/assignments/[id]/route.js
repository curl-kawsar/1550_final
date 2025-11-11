import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get single assignment
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    // Check if request is from admin or student
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-token')?.value;
    const studentToken = cookieStore.get('student-token')?.value;
    
    let isAdmin = false;
    let studentId = null;
    
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (['admin', 'super-admin'].includes(decoded.role)) {
          isAdmin = true;
        }
      } catch (error) {
        // Invalid admin token, continue to check student token
      }
    }
    
    if (!isAdmin && studentToken) {
      try {
        const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
        studentId = decoded.studentId;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }
    
    if (!isAdmin && !studentId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const assignment = await Assignment.findById(id).populate('createdBy', 'firstName lastName email');
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // If student request, check if assignment is active and hide answers
    if (!isAdmin) {
      if (!assignment.isActive) {
        return NextResponse.json({ error: 'Assignment not available' }, { status: 403 });
      }
      
      // Check if student already submitted
      const existingSubmission = await AssignmentSubmission.findOne({ 
        assignmentId: id, 
        studentId 
      });
      
      if (existingSubmission) {
        return NextResponse.json({ 
          error: 'Assignment already completed',
          submission: existingSubmission 
        }, { status: 409 });
      }
      
      // Return assignment without answers
      const studentAssignment = {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        timeLimit: assignment.timeLimit,
        totalQuestions: assignment.totalQuestions,
        questions: assignment.questions.map(q => ({
          _id: q._id,
          question: q.question,
          instruction: q.instruction,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD
          // Note: answer, points, and other sensitive fields are intentionally excluded
        })),
        createdAt: assignment.createdAt
      };
      
      return NextResponse.json({ assignment: studentAssignment });
    }
    
    // Admin gets full assignment with answers
    return NextResponse.json({ assignment: assignment.toObject() });
    
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update assignment (Admin only)
export async function PUT(request, { params }) {
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
    
    const body = await request.json();
    
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Assignment updated successfully',
      assignment: assignment.toObject()
    });
    
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete assignment (Admin only)
export async function DELETE(request, { params }) {
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
    
    const assignment = await Assignment.findByIdAndDelete(id);
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // Also delete all submissions for this assignment
    await AssignmentSubmission.deleteMany({ assignmentId: id });
    
    return NextResponse.json({
      message: 'Assignment deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
