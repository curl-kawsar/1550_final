import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClassStructure from '@/models/ClassStructure';
import Module from '@/models/Module';
import Video from '@/models/Video';
import { verifyAdminToken } from '@/lib/auth';

// Get specific class structure (Admin only)
export async function GET(request, { params }) {
  try {
    // Verify admin token
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectToDatabase();
    
    const classStructure = await ClassStructure.findById(id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!classStructure) {
      return NextResponse.json(
        { error: 'Class structure not found' },
        { status: 404 }
      );
    }

    // Get modules for this class structure
    const modules = await Module.find({ classStructure: id, isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    // Get videos for each module
    const modulesWithVideos = await Promise.all(
      modules.map(async (module) => {
        const videos = await Video.find({ module: module._id, isActive: true })
          .sort({ sortOrder: 1, createdAt: 1 })
          .lean();
        return { ...module, videos };
      })
    );
    
    return NextResponse.json({
      classStructure: {
        ...classStructure,
        modules: modulesWithVideos
      }
    });
    
  } catch (error) {
    console.error('Error fetching class structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update class structure (Admin only)
export async function PATCH(request, { params }) {
  try {
    // Verify admin token
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, overview, description, requiresPayment, sortOrder, isActive } = body;

    await connectToDatabase();

    const classStructure = await ClassStructure.findById(id);
    if (!classStructure) {
      return NextResponse.json(
        { error: 'Class structure not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (title !== undefined) classStructure.title = title.trim();
    if (overview !== undefined) classStructure.overview = overview.trim();
    if (description !== undefined) classStructure.description = description.trim();
    if (requiresPayment !== undefined) classStructure.requiresPayment = requiresPayment;
    if (sortOrder !== undefined) classStructure.sortOrder = sortOrder;
    if (isActive !== undefined) classStructure.isActive = isActive;

    await classStructure.save();

    // Populate for response
    const populatedStructure = await ClassStructure.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Class structure updated successfully',
      classStructure: populatedStructure
    });

  } catch (error) {
    console.error('Error updating class structure:', error);
    
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

// Delete class structure (Admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin token
    const adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectToDatabase();

    const classStructure = await ClassStructure.findById(id);
    if (!classStructure) {
      return NextResponse.json(
        { error: 'Class structure not found' },
        { status: 404 }
      );
    }

    // Also delete associated modules and videos
    const modules = await Module.find({ classStructure: id });
    const moduleIds = modules.map(m => m._id);
    
    // Delete videos first
    await Video.deleteMany({ module: { $in: moduleIds } });
    
    // Delete modules
    await Module.deleteMany({ classStructure: id });
    
    // Delete class structure
    await ClassStructure.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Class structure and associated content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting class structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
