import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import DiagnosticTest from '@/models/DiagnosticTest';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// Get all diagnostic tests (Admin only)
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
    const status = searchParams.get('status'); // 'active', 'inactive', 'upcoming', 'past'
    const includeEnrollment = searchParams.get('includeEnrollment') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (status === 'past') {
      query.date = { $lt: new Date() };
    }
    
    // Get diagnostic tests with pagination
    const diagnosticTests = await DiagnosticTest.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1, sortOrder: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Update enrollment counts if requested
    if (includeEnrollment) {
      for (let test of diagnosticTests) {
        const testDoc = await DiagnosticTest.findById(test._id);
        await testDoc.updateEnrollmentCount();
        test.currentEnrollment = testDoc.currentEnrollment;
      }
    }
    
    // Get total count for pagination
    const total = await DiagnosticTest.countDocuments(query);
    
    return NextResponse.json({
      diagnosticTests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching diagnostic tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new diagnostic test (Admin only)
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
    const { 
      name, 
      date, 
      startTime, 
      endTime, 
      timezone, 
      capacity, 
      location, 
      description, 
      instructions, 
      sortOrder,
      duration 
    } = body;
    
    // Validation
    if (!name || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, date, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    // Check if diagnostic test name already exists
    const existingTest = await DiagnosticTest.findOne({ name });
    if (existingTest) {
      return NextResponse.json(
        { error: 'A diagnostic test with this name already exists' },
        { status: 409 }
      );
    }
    
    // Validate date is in the future
    const testDate = new Date(date);
    if (testDate <= new Date()) {
      return NextResponse.json(
        { error: 'Test date must be in the future' },
        { status: 400 }
      );
    }
    
    // Create diagnostic test
    const diagnosticTest = new DiagnosticTest({
      name,
      date: testDate,
      startTime,
      endTime,
      timezone: timezone || 'PST',
      capacity: capacity || 100,
      location: location || 'Online',
      description: description || '',
      instructions: instructions || '',
      sortOrder: sortOrder || 0,
      duration: duration || 210,
      createdBy: decoded.adminId
    });
    
    await diagnosticTest.save();
    
    // Populate creator info for response
    await diagnosticTest.populate('createdBy', 'name email');
    
    return NextResponse.json({
      message: 'Diagnostic test created successfully',
      diagnosticTest: diagnosticTest.toObject({ virtuals: true })
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating diagnostic test:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A diagnostic test with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
