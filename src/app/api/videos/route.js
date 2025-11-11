import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Video from '@/models/Video';
import Module from '@/models/Module';
import { verifyAdminToken } from '@/lib/auth';

// Get all videos (Admin only)
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
    const moduleId = searchParams.get('module');

    await connectToDatabase();
    
    let query = {};
    if (moduleId) {
      query.module = moduleId;
    }

    const videos = await Video.find(query)
      .populate({
        path: 'module',
        populate: {
          path: 'classStructure',
          select: 'title'
        }
      })
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      videos
    });
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new video (Admin only)
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
    const { title, description, embedCode, module, duration, thumbnailUrl, sortOrder } = body;

    // Validation
    if (!title || !embedCode || !module) {
      return NextResponse.json(
        { error: 'Title, embed code, and module are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify module exists
    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const video = new Video({
      title: title.trim(),
      description: description?.trim() || '',
      embedCode: embedCode.trim(),
      module,
      duration: duration?.trim() || '',
      thumbnailUrl: thumbnailUrl?.trim() || '',
      sortOrder: sortOrder || 0,
      createdBy: adminPayload.id
    });

    await video.save();

    // Populate the created video for response
    const populatedVideo = await Video.findById(video._id)
      .populate({
        path: 'module',
        populate: {
          path: 'classStructure',
          select: 'title'
        }
      })
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Video created successfully',
      video: populatedVideo
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video:', error);
    
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
