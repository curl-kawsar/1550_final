import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

// Submit assignment (Student only)
export async function POST(request) {
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
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const studentId = decoded.studentId;
    const studentEmail = decoded.email;
    
    const body = await request.json();
    const { assignmentId, answers, timeSpent } = body;
    
    // Validation
    if (!assignmentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Assignment ID and answers are required' },
        { status: 400 }
      );
    }
    
    if (!timeSpent || timeSpent < 0) {
      return NextResponse.json(
        { error: 'Time spent is required and must be positive' },
        { status: 400 }
      );
    }
    
    // Check if assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    if (!assignment.isActive) {
      return NextResponse.json({ error: 'Assignment is not active' }, { status: 403 });
    }
    
    // Validate answers length
    if (answers.length !== assignment.questions.length) {
      return NextResponse.json(
        { error: 'Number of answers does not match number of questions' },
        { status: 400 }
      );
    }
    
    // Validate each answer
    for (let i = 0; i < answers.length; i++) {
      if (!['A', 'B', 'C', 'D'].includes(answers[i])) {
        return NextResponse.json(
          { error: `Answer ${i + 1} must be A, B, C, or D` },
          { status: 400 }
        );
      }
    }
    
    // Create submission manually
    try {
      // Check if student already submitted
      const existingSubmission = await AssignmentSubmission.findOne({ assignmentId, studentId });
      if (existingSubmission) {
        return NextResponse.json(
          { error: 'You have already submitted this assignment' },
          { status: 409 }
        );
      }

      // Calculate results
      const submissionAnswers = [];
      let correctAnswers = 0;

      assignment.questions.forEach((question, index) => {
        const studentAnswer = answers[index];
        const isCorrect = studentAnswer === question.answer;
        
        if (isCorrect) correctAnswers++;

        submissionAnswers.push({
          questionId: question._id,
          selectedAnswer: studentAnswer,
          correctAnswer: question.answer,
          isCorrect
        });
      });

      const totalQuestions = assignment.questions.length;
      const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Create submission
      const submission = new AssignmentSubmission({
        assignmentId,
        studentId,
        studentEmail,
        answers: submissionAnswers,
        score: correctAnswers,
        percentage,
        totalQuestions,
        correctAnswers,
        timeSpent
      });

      await submission.save();
      
      // Populate assignment details for response
      await submission.populate('assignmentId', 'title description');
      
      // Calculate grade
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';
      
      return NextResponse.json({
        message: 'Assignment submitted successfully',
        submission: {
          _id: submission._id,
          assignmentTitle: submission.assignmentId.title,
          score: submission.score,
          percentage: submission.percentage,
          grade: grade,
          totalQuestions: submission.totalQuestions,
          correctAnswers: submission.correctAnswers,
          timeSpent: submission.timeSpent,
          submittedAt: submission.submittedAt
        }
      }, { status: 201 });
      
    } catch (submissionError) {
      if (submissionError.message === 'Assignment already submitted') {
        return NextResponse.json(
          { error: 'You have already submitted this assignment' },
          { status: 409 }
        );
      }
      throw submissionError;
    }
    
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
