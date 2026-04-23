import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictAuditLog from '@/models/DistrictAuditLog';
import { nanoid } from 'nanoid';

const CLAIM_TOKEN_LENGTH = 32;
const CLAIM_EXPIRY_DAYS = 30;

export async function POST(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { studentIds, expiryDays } = body;

    const submission = await DistrictSubmission.findById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const studentQuery = { submission: id };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      studentQuery._id = { $in: studentIds };
    }
    const students = await DistrictStudent.find(studentQuery).lean();

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students found' }, { status: 400 });
    }

    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const days = expiryDays || CLAIM_EXPIRY_DAYS;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const results = [];

    for (const student of students) {
      const claimToken = nanoid(CLAIM_TOKEN_LENGTH);
      const claimLink = `${websiteUrl}/register/claim/${claimToken}`;

      await DistrictStudent.findByIdAndUpdate(student._id, {
        claimToken,
        claimTokenExpiresAt: expiresAt,
        registrationLink: claimLink
      });

      await DistrictAuditLog.create({
        action: 'claim_link_generated',
        submission: id,
        student: student._id,
        performedBy: admin.name || admin.email,
        details: {
          studentName: `${student.firstName} ${student.lastName}`,
          claimLink,
          expiresAt: expiresAt.toISOString()
        }
      });

      results.push({
        studentId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        claimLink
      });
    }

    return NextResponse.json({
      success: true,
      generatedCount: results.length,
      expiresAt: expiresAt.toISOString(),
      students: results
    });
  } catch (error) {
    console.error('Error generating claim links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
