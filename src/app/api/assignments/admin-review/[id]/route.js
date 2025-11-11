import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get assignment review for admin (shows student answers and correct answers)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params; // This is the submission ID for admin
    
    // Verify admin token
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-token')?.value;
    
    if (!adminToken) {
      return NextResponse.json({ error: 'No admin authentication token' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    }
    
    // Verify admin access
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !['admin', 'super-admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Get submission by ID with populated data
    const submission = await AssignmentSubmission.findById(id)
      .populate('assignmentId')
      .populate('studentId', 'firstName lastName email');
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    const assignment = submission.assignmentId;
    
    // Create review data with questions, student answers, and correct answers
    const reviewData = {
      submission: {
        _id: submission._id,
        assignmentId: {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          totalQuestions: assignment.totalQuestions,
          timeLimit: assignment.timeLimit,
          questions: assignment.questions.map((question, index) => {
            const studentAnswerObj = submission.answers[index];
            const studentAnswer = studentAnswerObj?.selectedAnswer || null;
            
            return {
              _id: question._id,
              question: question.question,
              instruction: question.instruction,
              options: [question.optionA, question.optionB, question.optionC, question.optionD],
              answer: question.answer,
              points: question.points || 1,
              studentAnswer: studentAnswer,
              isCorrect: studentAnswer === question.answer
            };
          })
        },
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
    
    // Calculate grade
    let grade = 'F';
    if (submission.percentage >= 90) grade = 'A';
    else if (submission.percentage >= 80) grade = 'B';
    else if (submission.percentage >= 70) grade = 'C';
    else if (submission.percentage >= 60) grade = 'D';
    
    reviewData.submission.grade = grade;
    
    return NextResponse.json(reviewData);
    
  } catch (error) {
    console.error('Error fetching admin assignment review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
