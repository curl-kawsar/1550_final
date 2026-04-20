import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id, studentId } = await params;
    const body = await request.json();

    const allowedFields = [
      'firstName', 'lastName', 'grade', 'highSchoolName',
      'parentFirstName', 'parentLastName', 'parentEmail',
      'status', 'notes'
    ];

    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    const student = await DistrictStudent.findOneAndUpdate(
      { _id: studentId, submission: id },
      update,
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await DistrictAuditLog.create({
      action: 'student_nominee_edited',
      submission: id,
      student: studentId,
      performedBy: admin.name || admin.email,
      details: { updatedFields: Object.keys(update) }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error updating district student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id, studentId } = await params;

    const student = await DistrictStudent.findOneAndDelete({ _id: studentId, submission: id });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await DistrictAuditLog.create({
      action: 'student_removed',
      submission: id,
      student: studentId,
      performedBy: admin.name || admin.email,
      details: { studentName: `${student.firstName} ${student.lastName}` }
    });

    return NextResponse.json({ success: true, message: 'Student removed' });
  } catch (error) {
    console.error('Error deleting district student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
