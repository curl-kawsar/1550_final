import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictEmailTemplate from '@/models/DistrictEmailTemplate';
import DistrictAuditLog from '@/models/DistrictAuditLog';
import { generateStudentEmails } from '@/lib/districtEmailUtils';

export async function POST(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { templateId, studentIds } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const submission = await DistrictSubmission.findById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const template = await DistrictEmailTemplate.findById(templateId);
    if (!template || !template.isActive) {
      return NextResponse.json({ error: 'Template not found or inactive' }, { status: 404 });
    }

    // Get students to generate for
    const studentQuery = { submission: id };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      studentQuery._id = { $in: studentIds };
    }
    const students = await DistrictStudent.find(studentQuery).lean();

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students selected' }, { status: 400 });
    }

    // Check for missing required fields
    const incomplete = students.filter(s =>
      !s.firstName || !s.lastName || !s.parentEmail || !s.parentFirstName
    );
    if (incomplete.length > 0) {
      return NextResponse.json({
        error: `${incomplete.length} student(s) have missing required fields`,
        incompleteStudents: incomplete.map(s => s._id)
      }, { status: 400 });
    }

    const districtData = {
      districtName: submission.districtName,
      schoolName: submission.schoolName,
      registrationCode: submission.registrationCode,
      representativeName: submission.representativeName
    };

    const generated = generateStudentEmails(students, template, districtData);

    // Update each student with generated content
    for (const email of generated) {
      await DistrictStudent.findByIdAndUpdate(email.studentId, {
        generatedEmailContent: email.html,
        status: 'Generated'
      });
    }

    // Update submission counts
    const generatedCount = await DistrictStudent.countDocuments({
      submission: id,
      status: { $in: ['Generated', 'Included in Package', 'Sent to Representative', 'Registered'] }
    });
    await DistrictSubmission.findByIdAndUpdate(id, {
      totalGenerated: generatedCount,
      status: submission.status === 'New' || submission.status === 'Under Review'
        ? 'Ready for Generation' : submission.status
    });

    await DistrictAuditLog.create({
      action: 'student_email_files_generated',
      submission: id,
      performedBy: admin.name || admin.email,
      details: {
        templateName: template.name,
        studentCount: generated.length
      }
    });

    return NextResponse.json({
      success: true,
      generatedCount: generated.length,
      generated: generated.map(g => ({
        studentId: g.studentId,
        name: `${g.firstName} ${g.lastName}`,
        subject: g.subject
      }))
    });
  } catch (error) {
    console.error('Error generating district emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
