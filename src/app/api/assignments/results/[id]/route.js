import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import jwt from 'jsonwebtoken';

// Get assignment results (Admin only)
export async function GET(request, { params }) {
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
    
    // Get assignment results
    const results = await AssignmentSubmission.find({ assignmentId: id })
      .populate('studentId', 'firstName lastName email')
      .sort({ submittedAt: -1 });
    
    // Calculate statistics
    const stats = {
      totalSubmissions: results.length,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      lowestScore: 0,
      gradeDistribution: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0
      }
    };
    
    if (results.length > 0) {
      const scores = results.map(r => r.score);
      const percentages = results.map(r => r.percentage);
      
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.averagePercentage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
      stats.highestScore = Math.max(...scores);
      stats.lowestScore = Math.min(...scores);
      
      // Count grade distribution
      results.forEach(result => {
        let grade = 'F';
        if (result.percentage >= 90) grade = 'A';
        else if (result.percentage >= 80) grade = 'B';
        else if (result.percentage >= 70) grade = 'C';
        else if (result.percentage >= 60) grade = 'D';
        
        stats.gradeDistribution[grade]++;
      });
    }
    
    return NextResponse.json({
      results,
      statistics: stats
    });
    
  } catch (error) {
    console.error('Error fetching assignment results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
