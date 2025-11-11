import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import jwt from 'jsonwebtoken';

// Get assignment review for student (shows their answers and correct answers)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params; // This is the submission ID for students
    
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
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const studentId = decoded.studentId;
    
    // Get student's submission by ID and verify ownership
    const submission = await AssignmentSubmission.findOne({ 
      _id: id, 
      studentId 
    }).populate('assignmentId');
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
    }
    
    const assignment = submission.assignmentId;
    
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
        score: submission.score,
        percentage: submission.percentage,
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt
      },
      questions: assignment.questions.map((question, index) => {
        const studentAnswerObj = submission.answers[index];
        const studentAnswer = studentAnswerObj?.selectedAnswer || null;
        
        return {
          _id: question._id,
          questionNumber: index + 1,
          question: question.question,
          instruction: question.instruction,
          options: {
            A: question.optionA,
            B: question.optionB,
            C: question.optionC,
            D: question.optionD
          },
          correctAnswer: question.answer,
          studentAnswer: studentAnswer,
          isCorrect: studentAnswer === question.answer,
          points: question.points || 1
        };
      })
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
    console.error('Error fetching student assignment review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
