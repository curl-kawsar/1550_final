import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import ClassTime from '@/models/ClassTime';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get all class times (Admin only)
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
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status'); // 'active', 'inactive'
    const includeEnrollment = searchParams.get('includeEnrollment') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    // Get class times with pagination
    const classTimes = await ClassTime.find(query)
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Update enrollment counts if requested
    if (includeEnrollment) {
      for (let classTime of classTimes) {
        const classTimeDoc = await ClassTime.findById(classTime._id);
        await classTimeDoc.updateEnrollmentCount();
        classTime.currentEnrollment = classTimeDoc.currentEnrollment;
      }
    }
    
    // Get total count for pagination
    const total = await ClassTime.countDocuments(query);
    
    return NextResponse.json({
      classTimes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalClassTimes: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching class times:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new class time (Admin only)
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
    const { name, dayOfWeek, startTime, endTime, timezone, capacity, minimumRequired, description, sortOrder } = body;
    
    // Validation
    if (!name || !dayOfWeek || !Array.isArray(dayOfWeek) || dayOfWeek.length === 0 || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, days of week, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    // Check if class time name already exists
    const existingClassTime = await ClassTime.findOne({ name });
    if (existingClassTime) {
      return NextResponse.json(
        { error: 'A class time with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create class time
    const classTime = new ClassTime({
      name,
      dayOfWeek,
      startTime,
      endTime,
      timezone: timezone || 'Pacific',
      capacity: capacity || 50,
      minimumRequired: minimumRequired || 40,
      description: description || '',
      sortOrder: sortOrder || 0,
      createdBy: decoded.adminId
    });
    
    await classTime.save();
    
    // Populate creator info for response
    await classTime.populate('createdBy', 'name email');
    
    return NextResponse.json({
      message: 'Class time created successfully',
      classTime: classTime.toObject({ virtuals: true })
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating class time:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A class time with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
