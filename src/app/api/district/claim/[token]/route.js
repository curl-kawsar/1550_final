import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Claim token is required' }, { status: 400 });
    }

    const student = await DistrictStudent.findOne({
      claimToken: token,
      claimTokenExpiresAt: { $gte: new Date() }
    });

    if (!student) {
      const expiredStudent = await DistrictStudent.findOne({ claimToken: token });
      if (expiredStudent) {
        return NextResponse.json({ error: 'This claim link has expired. Please contact your district representative for a new link.' }, { status: 410 });
      }
      return NextResponse.json({ error: 'Invalid claim link. Please check the link and try again.' }, { status: 404 });
    }

    if (student.claimStatus === 'claim_completed') {
      return NextResponse.json({ error: 'This claim has already been completed. If you need help, please contact support.' }, { status: 409 });
    }

    const submission = await DistrictSubmission.findById(student.submission);
    if (!submission) {
      return NextResponse.json({ error: 'District submission not found' }, { status: 404 });
    }

    const isFirstOpen = student.claimStatus === 'none';
    const updateFields = {};

    if (isFirstOpen) {
      updateFields.claimStatus = 'link_opened';
      updateFields.claimOpenedAt = new Date();
      updateFields.status = 'Link Opened';
    }

    if (Object.keys(updateFields).length > 0) {
      await DistrictStudent.findByIdAndUpdate(student._id, updateFields);
    }

    if (isFirstOpen) {
      await DistrictAuditLog.create({
        action: 'claim_link_opened',
        submission: student.submission,
        student: student._id,
        performedBy: 'system',
        details: {
          studentName: `${student.firstName} ${student.lastName}`,
          parentEmail: student.parentEmail
        }
      });
    }

    return NextResponse.json({
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      grade: student.grade,
      highSchoolName: student.highSchoolName || '',
      parentFirstName: student.parentFirstName,
      parentLastName: student.parentLastName,
      parentEmail: student.parentEmail,
      districtName: submission.districtName,
      registrationCode: submission.registrationCode,
      submissionId: submission._id,
      studentId: student._id,
      claimStatus: student.claimStatus === 'none' ? 'link_opened' : student.claimStatus
    });
  } catch (error) {
    console.error('Error validating claim token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
