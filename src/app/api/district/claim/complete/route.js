import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictAuditLog from '@/models/DistrictAuditLog';
import Student from '@/models/Student';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { claimToken, studentId } = body;

    if (!claimToken || !studentId) {
      return NextResponse.json({ error: 'claimToken and studentId are required' }, { status: 400 });
    }

    const districtStudent = await DistrictStudent.findOne({ claimToken });
    if (!districtStudent) {
      return NextResponse.json({ error: 'Invalid claim token' }, { status: 404 });
    }

    if (districtStudent.claimStatus === 'claim_completed') {
      return NextResponse.json({ error: 'Claim already completed' }, { status: 409 });
    }

    let duplicateCheckStatus = 'clean';
    const registeredStudent = await Student.findById(studentId).lean();
    if (registeredStudent) {
      const existingDuplicate = await Student.findOne({
        _id: { $ne: studentId },
        $or: [
          { email: registeredStudent.email },
          { parentEmail: registeredStudent.parentEmail }
        ]
      }).lean();

      if (existingDuplicate) {
        duplicateCheckStatus = 'flagged';

        await DistrictAuditLog.create({
          action: 'duplicate_review_triggered',
          submission: districtStudent.submission,
          student: districtStudent._id,
          performedBy: 'system',
          details: {
            newStudentId: studentId,
            existingStudentId: existingDuplicate._id,
            matchField: existingDuplicate.email === registeredStudent.email ? 'email' : 'parentEmail'
          }
        });
      }
    }

    await DistrictStudent.findByIdAndUpdate(districtStudent._id, {
      claimStatus: 'claim_completed',
      claimCompletedAt: new Date(),
      convertedStudentId: studentId,
      status: duplicateCheckStatus === 'flagged' ? 'Duplicate Review' : 'Registered',
      duplicateCheckStatus,
      optInStatus: 'pending'
    });

    const registeredCount = await DistrictStudent.countDocuments({
      submission: districtStudent.submission,
      status: { $in: ['Registered', 'Claim Completed', 'Opt-In Pending', 'Opt-In Confirmed'] }
    });

    const submission = await DistrictSubmission.findById(districtStudent.submission);
    if (submission) {
      const newStatus = registeredCount >= submission.studentCount
        ? 'Completed'
        : registeredCount > 0 ? 'Partially Converted' : submission.status;

      await DistrictSubmission.findByIdAndUpdate(submission._id, {
        totalRegistered: registeredCount,
        status: newStatus
      });
    }

    await DistrictAuditLog.create({
      action: 'claim_completed',
      submission: districtStudent.submission,
      student: districtStudent._id,
      performedBy: 'system',
      details: {
        studentName: `${districtStudent.firstName} ${districtStudent.lastName}`,
        convertedStudentId: studentId,
        duplicateCheckStatus
      }
    });

    return NextResponse.json({
      success: true,
      status: duplicateCheckStatus === 'flagged' ? 'Duplicate Review' : 'Registered',
      duplicateCheckStatus
    });
  } catch (error) {
    console.error('Error completing claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
