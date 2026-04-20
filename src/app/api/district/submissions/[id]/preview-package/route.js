import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';

export async function POST(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { studentIds } = body;

    const submission = await DistrictSubmission.findById(id).lean();
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const studentQuery = {
      submission: id,
      status: { $in: ['Generated', 'Included in Package'] },
      generatedEmailContent: { $ne: '' }
    };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      studentQuery._id = { $in: studentIds };
    }

    const students = await DistrictStudent.find(studentQuery)
      .select('firstName lastName parentEmail status generatedEmailContent')
      .lean();

    if (students.length === 0) {
      return NextResponse.json({
        error: 'No generated emails found. Please generate emails first.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      submission: {
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        representativeName: submission.representativeName,
        representativeEmail: submission.representativeEmail,
        registrationCode: submission.registrationCode
      },
      previewStudents: students.map(s => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        parentEmail: s.parentEmail,
        status: s.status,
        emailPreview: s.generatedEmailContent.substring(0, 500) + '...'
      })),
      totalInPackage: students.length
    });
  } catch (error) {
    console.error('Error previewing district package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
