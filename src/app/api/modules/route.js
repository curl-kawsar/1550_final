import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Module from '@/models/Module';
import ClassStructure from '@/models/ClassStructure';
import { verifyAdminToken } from '@/lib/auth';

// Get all modules (Admin only)
export async function GET(request) {
  try {
    // Verify admin token
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classStructureId = searchParams.get('classStructure');

    await connectToDatabase();
    
    let query = {};
    if (classStructureId) {
      query.classStructure = classStructureId;
    }

    const modules = await Module.find(query)
      .populate('classStructure', 'title')
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      modules
    });
    
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new module (Admin only)
export async function POST(request) {
  try {
    // Verify admin token
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, classStructure, duration, objectives, sortOrder } = body;

    // Validation
    if (!title || !classStructure) {
      return NextResponse.json(
        { error: 'Title and class structure are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify class structure exists
    const classStructureExists = await ClassStructure.findById(classStructure);
    if (!classStructureExists) {
      return NextResponse.json(
        { error: 'Class structure not found' },
        { status: 404 }
      );
    }

    const module = new Module({
      title: title.trim(),
      description: description?.trim() || '',
      classStructure,
      duration: duration?.trim() || '',
      objectives: objectives || [],
      sortOrder: sortOrder || 0,
      createdBy: adminPayload.id
    });

    await module.save();

    // Populate the created module for response
    const populatedModule = await Module.findById(module._id)
      .populate('classStructure', 'title')
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Module created successfully',
      module: populatedModule
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating module:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
