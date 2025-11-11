import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get all assignments (Admin only)
export async function GET(request) {
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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status'); // 'active', 'inactive'
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    // Get assignments with pagination
    const assignments = await Assignment.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Assignment.countDocuments(query);
    
    return NextResponse.json({
      assignments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAssignments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new assignment (Admin only)
export async function POST(request) {
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
    
    const body = await request.json();
    const { title, description, timeLimit, questions } = body;
    
    // Validation
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.answer) {
        return NextResponse.json(
          { error: `Question ${i + 1} is missing required fields` },
          { status: 400 }
        );
      }
      
      if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
        return NextResponse.json(
          { error: `Question ${i + 1} has invalid answer. Must be A, B, C, or D` },
          { status: 400 }
        );
      }
    }
    
    // Create assignment
    const assignment = new Assignment({
      title,
      description: description || '',
      timeLimit: timeLimit || 60,
      questions,
      createdBy: decoded.adminId
    });
    
    await assignment.save();
    
    // Populate creator info for response
    await assignment.populate('createdBy', 'firstName lastName email');
    
    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment: assignment.toObject()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
