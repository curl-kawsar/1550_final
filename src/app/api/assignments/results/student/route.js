import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import jwt from 'jsonwebtoken';

// Get student's assignment results
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
      console.error('JWT verification error in assignments/results/student:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const studentId = decoded.studentId;
    
    // Get student's results
    const results = await AssignmentSubmission.find({ studentId })
      .populate('assignmentId', 'title description createdAt')
      .sort({ submittedAt: -1 });
    
    // Format results for student view (hide detailed answers)
    const formattedResults = results.map(result => {
      // Calculate grade
      let grade = 'F';
      if (result.percentage >= 90) grade = 'A';
      else if (result.percentage >= 80) grade = 'B';
      else if (result.percentage >= 70) grade = 'C';
      else if (result.percentage >= 60) grade = 'D';

      return {
        _id: result._id,
        assignmentId: result.assignmentId._id,
        assignmentTitle: result.assignmentId.title,
        assignmentDescription: result.assignmentId.description,
        score: result.score,
        percentage: result.percentage,
        grade: grade,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: result.timeSpent,
        submittedAt: result.submittedAt,
        // Don't include detailed answers for security
      };
    });
    
    return NextResponse.json({
      results: formattedResults
    });
    
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
