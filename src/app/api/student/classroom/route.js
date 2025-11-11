import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClassStructure from '@/models/ClassStructure';
import Module from '@/models/Module';
import Video from '@/models/Video';
import Student from '@/models/Student';
import { verifyStudentToken } from '@/lib/auth';

// Get classroom content for students
export async function GET(request) {
  try {
    // Verify student token
    const studentPayload = await verifyStudentToken(request);
    if (!studentPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Student login required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get student information to check payment status
    const student = await Student.findById(studentPayload.studentId).lean();
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get all active class structures
    const classStructures = await ClassStructure.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (classStructures.length === 0) {
      return NextResponse.json({
        classStructures: [],
        hasAccess: false,
        message: 'No classroom content available yet.'
      });
    }

    // Filter based on payment status
    const accessibleStructures = [];
    
    for (const structure of classStructures) {
      // Check if structure requires payment and if student has paid
      if (structure.requiresPayment && !student.hasPaidSpecialOffer) {
        // Student doesn't have access - return limited info
        accessibleStructures.push({
          _id: structure._id,
          title: structure.title,
          overview: structure.overview,
          description: structure.description,
          requiresPayment: true,
          hasAccess: false,
          modules: []
        });
      } else {
        // Student has access - return full content
        const modules = await Module.find({ 
          classStructure: structure._id, 
          isActive: true 
        })
          .sort({ sortOrder: 1, createdAt: 1 })
          .lean();

        const modulesWithVideos = await Promise.all(
          modules.map(async (module) => {
            const videos = await Video.find({ 
              module: module._id, 
              isActive: true 
            })
              .sort({ sortOrder: 1, createdAt: 1 })
              .lean();
            return { ...module, videos };
          })
        );

        accessibleStructures.push({
          ...structure,
          hasAccess: true,
          modules: modulesWithVideos
        });
      }
    }

    return NextResponse.json({
      classStructures: accessibleStructures,
      hasAccess: student.hasPaidSpecialOffer,
      paymentStatus: student.paymentStatus,
      studentInfo: {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email
      }
    });
    
  } catch (error) {
    console.error('Error fetching classroom content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
