import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get assignment review for student or admin (shows their answers and correct answers)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const url = new URL(request.url);
    const submissionId = url.searchParams.get('submissionId');
    
    // Check for both student and admin tokens
    const cookieStore = await cookies();
    const studentToken = cookieStore.get('student-token')?.value;
    const adminToken = cookieStore.get('admin-token')?.value;
    
    let isAdmin = false;
    let studentId = null;
    
    if (adminToken) {
      // Admin access - can view any submission
      try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);
        if (!admin || !['admin', 'super-admin'].includes(admin.role)) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        isAdmin = true;
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
      }
    } else if (studentToken) {
      // Student access - can only view their own submission
      try {
        const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
        studentId = decoded.studentId;
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid student token' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }
    
    let submission;
    let assignment;
    
    if (isAdmin && submissionId) {
      // Admin viewing specific submission by ID
      submission = await AssignmentSubmission.findById(submissionId)
        .populate('assignmentId')
        .populate('studentId', 'firstName lastName email');
      
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
      
      assignment = submission.assignmentId;
    } else {
      // Student viewing their own submission or admin viewing by assignment ID
      assignment = await Assignment.findById(id);
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }
      
      const query = { assignmentId: id };
      if (!isAdmin) {
        query.studentId = studentId; // Students can only see their own submissions
      }
      
      submission = await AssignmentSubmission.findOne(query)
        .populate('studentId', 'firstName lastName email');
      
      if (!submission) {
        return NextResponse.json({ error: 'No submission found for this assignment' }, { status: 404 });
      }
    }
    
    // Create review data with questions, student answers, and correct answers
    const reviewData = {
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        totalQuestions: assignment.totalQuestions,
        timeLimit: assignment.timeLimit
      },
      submission: {
        _id: submission._id,
        assignmentId: assignment,
        studentId: submission.studentId,
        score: submission.score,
        percentage: submission.percentage,
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt,
        answers: submission.answers
      }
    };
    
    // Add questions with correct format for the frontend
    if (assignment.questions && assignment.questions.length > 0) {
      reviewData.submission.assignmentId = {
        ...assignment.toObject(),
        questions: assignment.questions.map((question, index) => {
          const studentAnswer = submission.answers[index];
          
          return {
            _id: question._id,
            question: question.question,
            instruction: question.instruction,
            options: [question.optionA, question.optionB, question.optionC, question.optionD],
            answer: question.answer,
            points: question.points || 1
          };
        })
      };
    }
    
    // Calculate grade
    let grade = 'F';
    if (submission.percentage >= 90) grade = 'A';
    else if (submission.percentage >= 80) grade = 'B';
    else if (submission.percentage >= 70) grade = 'C';
    else if (submission.percentage >= 60) grade = 'D';
    
    reviewData.submission.grade = grade;
    
    return NextResponse.json(reviewData);
    
  } catch (error) {
    console.error('Error fetching assignment review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
