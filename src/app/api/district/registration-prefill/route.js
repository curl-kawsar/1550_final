import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';

/**
 * GET /api/district/registration-prefill?code=DIST-...&claimToken=optional
 * Public. Used to pre-fill /register?code=...&claimToken=... from district emails.
 *
 * - code only: submission-level (registration code, district, school) — partial prefill
 * - code + claimToken: one nominee, full prefill, token must be valid and not expired
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim();
    const claimToken = searchParams.get('claimToken')?.trim();

    if (!code && !claimToken) {
      return NextResponse.json(
        { error: 'Query parameter "code" or "claimToken" is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const now = new Date();

    if (claimToken && !code) {
      const student = await DistrictStudent.findOne({ claimToken }).lean();
      if (!student) {
        return NextResponse.json({ error: 'Invalid or unknown claim link' }, { status: 404 });
      }
      if (student.claimTokenExpiresAt && new Date(student.claimTokenExpiresAt) < now) {
        return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
      }
      if (student.claimStatus === 'claim_completed') {
        return NextResponse.json({ error: 'This registration was already completed' }, { status: 409 });
      }
      const submission = await DistrictSubmission.findById(student.submission).lean();
      if (!submission) {
        return NextResponse.json({ error: 'District submission not found' }, { status: 404 });
      }

      return NextResponse.json({
        partial: false,
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        grade: student.grade,
        highSchoolName: student.highSchoolName || '',
        parentFirstName: student.parentFirstName,
        parentLastName: student.parentLastName,
        parentEmail: student.parentEmail,
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        registrationCode: submission.registrationCode,
        submissionId: submission._id,
        studentId: student._id
      });
    }

    const submission = await DistrictSubmission.findOne({ registrationCode: code });
    if (!submission) {
      return NextResponse.json(
        { error: 'No district registration found for this code' },
        { status: 404 }
      );
    }

    if (!claimToken) {
      return NextResponse.json({
        partial: true,
        registrationCode: submission.registrationCode,
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        submissionId: submission._id
      });
    }

    const student = await DistrictStudent.findOne({
      claimToken,
      submission: submission._id
    }).lean();

    if (!student) {
      return NextResponse.json(
        { error: 'This claim does not match this district code' },
        { status: 404 }
      );
    }
    if (student.claimTokenExpiresAt && new Date(student.claimTokenExpiresAt) < now) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }
    if (student.claimStatus === 'claim_completed') {
      return NextResponse.json({ error: 'This registration was already completed' }, { status: 409 });
    }

    return NextResponse.json({
      partial: false,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      grade: student.grade,
      highSchoolName: student.highSchoolName || '',
      parentFirstName: student.parentFirstName,
      parentLastName: student.parentLastName,
      parentEmail: student.parentEmail,
      districtName: submission.districtName,
      schoolName: submission.schoolName,
      registrationCode: submission.registrationCode,
      submissionId: submission._id,
      studentId: student._id
    });
  } catch (error) {
    console.error('registration-prefill error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
