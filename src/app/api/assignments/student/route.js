import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

// Get active assignments for students
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Verify student token
    const cookieStore = await cookies();
    const token = cookieStore.get('student-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error in assignments/student:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const studentId = decoded.studentId;
    
    // Get active assignments
    const assignments = await Assignment.getActiveAssignments();
    
    // Get student's submissions to check which assignments are completed
    const submissions = await AssignmentSubmission.find({ studentId })
      .select('assignmentId _id')
      .lean();
    
    const completedAssignmentIds = submissions.map(sub => sub.assignmentId.toString());
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignmentId.toString()] = sub._id.toString();
    });
    
    // Add completion status and submission ID to assignments
    const assignmentsWithStatus = assignments.map(assignment => ({
      ...assignment.toObject(),
      isCompleted: completedAssignmentIds.includes(assignment._id.toString()),
      submissionId: submissionMap[assignment._id.toString()] || null,
      // Remove questions from list view for performance
      questions: undefined
    }));
    
    return NextResponse.json({
      assignments: assignmentsWithStatus
    });
    
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
