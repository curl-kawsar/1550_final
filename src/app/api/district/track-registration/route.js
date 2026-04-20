import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { registrationCode, studentEmail, studentName } = body;

    if (!registrationCode) {
      return NextResponse.json({ isDistrict: false });
    }

    // Check if this code matches a district submission
    const submission = await DistrictSubmission.findOne({ registrationCode });
    if (!submission) {
      return NextResponse.json({ isDistrict: false });
    }

    // Try to match the registering student to a nominee
    let matchedStudent = null;

    if (studentEmail) {
      matchedStudent = await DistrictStudent.findOne({
        submission: submission._id,
        parentEmail: studentEmail.toLowerCase()
      });
    }

    if (!matchedStudent && studentName) {
      const nameParts = studentName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        matchedStudent = await DistrictStudent.findOne({
          submission: submission._id,
          firstName: { $regex: new RegExp(`^${nameParts[0]}$`, 'i') },
          lastName: { $regex: new RegExp(`^${nameParts[nameParts.length - 1]}$`, 'i') }
        });
      }
    }

    if (matchedStudent) {
      await DistrictStudent.findByIdAndUpdate(matchedStudent._id, {
        status: 'Registered'
      });

      // Update submission counts
      const registeredCount = await DistrictStudent.countDocuments({
        submission: submission._id,
        status: 'Registered'
      });

      const newStatus = registeredCount === submission.studentCount
        ? 'Completed'
        : registeredCount > 0 ? 'Partially Converted' : submission.status;

      await DistrictSubmission.findByIdAndUpdate(submission._id, {
        totalRegistered: registeredCount,
        status: newStatus
      });

      await DistrictAuditLog.create({
        action: 'student_converted_to_registered',
        submission: submission._id,
        student: matchedStudent._id,
        performedBy: 'system',
        details: {
          studentName: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
          registrationCode
        }
      });
    }

    return NextResponse.json({
      isDistrict: true,
      districtName: submission.districtName,
      submissionId: submission._id,
      matched: !!matchedStudent
    });
  } catch (error) {
    console.error('Error tracking district registration:', error);
    return NextResponse.json({ isDistrict: false });
  }
}
