import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictPackage from '@/models/DistrictPackage';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function GET(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const submission = await DistrictSubmission.findById(id).lean();
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const students = await DistrictStudent.find({ submission: id }).lean();
    const packages = await DistrictPackage.find({ submission: id })
      .sort('-createdAt')
      .populate('templateUsed', 'name')
      .lean();

    const statusCounts = {};
    students.forEach(s => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      submission,
      students,
      packages,
      stats: {
        totalStudents: students.length,
        statusCounts,
        totalGenerated: students.filter(s => ['Generated', 'Included in Package', 'Sent to Representative', 'Registered'].includes(s.status)).length,
        totalRegistered: students.filter(s => s.status === 'Registered').length
      }
    });
  } catch (error) {
    console.error('Error fetching district submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'status', 'notes', 'representativeName', 'representativeRole',
      'representativeEmail', 'representativePhone'
    ];

    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    const submission = await DistrictSubmission.findByIdAndUpdate(id, update, { new: true });
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (body.status) {
      await DistrictAuditLog.create({
        action: 'submission_status_changed',
        submission: id,
        performedBy: admin.name || admin.email,
        details: { newStatus: body.status }
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error updating district submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
