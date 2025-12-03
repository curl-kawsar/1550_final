import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import VideoProgress from '@/models/VideoProgress';
import ClassStructure from '@/models/ClassStructure';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// GET - Get student's video progress
export async function GET(request) {
  try {
    await connectToDatabase();

    // Try to get token from both cookie names and authorization header
    const token = request.cookies.get('student-token')?.value || 
                 request.cookies.get('token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const studentId = decoded.studentId || decoded.id;

    // Get all progress for the student
    const progress = await VideoProgress.getStudentProgress(studentId);

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Video progress fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video progress' },
      { status: 500 }
    );
  }
}

// POST - Mark video as completed or update progress
export async function POST(request) {
  try {
    await connectToDatabase();

    // Try to get token from both cookie names and authorization header
    const token = request.cookies.get('student-token')?.value || 
                 request.cookies.get('token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const studentId = decoded.studentId || decoded.id;
    const { videoId, moduleId, structureId, watchData } = await request.json();

    if (!videoId || !moduleId || !structureId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mark video as completed
    const progress = await VideoProgress.markVideoCompleted(
      studentId,
      videoId,
      moduleId,
      structureId,
      watchData
    );

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Video progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update video progress' },
      { status: 500 }
    );
  }
}

// PUT - Update video watch progress (not completion)
export async function PUT(request) {
  try {
    await connectToDatabase();

    // Try to get token from both cookie names and authorization header
    const token = request.cookies.get('student-token')?.value || 
                 request.cookies.get('token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const studentId = decoded.studentId || decoded.id;
    const { videoId, moduleId, structureId, watchedDuration, totalDuration } = await request.json();

    if (!videoId || !moduleId || !structureId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const watchedPercentage = totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0;

    // Update watch progress without marking as completed
    const progress = await VideoProgress.findOneAndUpdate(
      { studentId, videoId },
      {
        studentId,
        videoId,
        moduleId,
        structureId,
        watchedDuration,
        totalDuration,
        watchedPercentage
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Video watch progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update watch progress' },
      { status: 500 }
    );
  }
}
