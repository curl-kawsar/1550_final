import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictEmailTemplate from '@/models/DistrictEmailTemplate';
import DistrictPackage from '@/models/DistrictPackage';
import DistrictAuditLog from '@/models/DistrictAuditLog';
import { sendDistrictPackage } from '@/lib/emailService';
import { buildSummaryEmailHtml, wrapEmailAsHtml } from '@/lib/districtEmailUtils';
import archiver from 'archiver';
import { PassThrough } from 'stream';

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

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

    const submission = await DistrictSubmission.findById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const template = templateId ? await DistrictEmailTemplate.findById(templateId) : null;

    // Get students with generated content
    const studentQuery = {
      submission: id,
      generatedEmailContent: { $ne: '' },
      status: { $in: ['Generated', 'Included in Package'] }
    };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      studentQuery._id = { $in: studentIds };
    }

    const students = await DistrictStudent.find(studentQuery).lean();

    if (students.length === 0) {
      return NextResponse.json({
        error: 'No generated emails to package. Generate emails first.'
      }, { status: 400 });
    }

    // Create ZIP of email HTML files
    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(passThrough);

    for (const student of students) {
      const filename = `${student.firstName}_${student.lastName}_invitation.html`
        .replace(/[^a-zA-Z0-9_.\-]/g, '_');
      const fullHtml = wrapEmailAsHtml(
        `Registration Invitation - ${student.firstName} ${student.lastName}`,
        student.generatedEmailContent
      );
      archive.append(fullHtml, { name: filename });
    }

    await archive.finalize();
    const zipBuffer = await streamToBuffer(passThrough);

    // Build summary email
    const summaryHtml = buildSummaryEmailHtml(
      {
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        representativeName: submission.representativeName,
        registrationCode: submission.registrationCode
      },
      students.length,
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );

    // Send the email
    const emailResult = await sendDistrictPackage(
      submission.representativeEmail,
      submission.representativeName,
      summaryHtml,
      zipBuffer,
      submission.districtName
    );

    // Create package record
    const pkg = await DistrictPackage.create({
      submission: id,
      templateUsed: templateId || template?._id,
      studentCount: students.length,
      sentAt: emailResult.success ? new Date() : null,
      sentBy: admin.id,
      recipientEmail: submission.representativeEmail,
      status: emailResult.success ? 'sent' : 'delivery_failed'
    });

    // Update student statuses
    if (emailResult.success) {
      await DistrictStudent.updateMany(
        { _id: { $in: students.map(s => s._id) } },
        { status: 'Sent to Representative' }
      );

      const sentCount = await DistrictStudent.countDocuments({
        submission: id,
        status: 'Sent to Representative'
      });

      await DistrictSubmission.findByIdAndUpdate(id, {
        totalSentToRep: sentCount,
        totalPackaged: students.length,
        status: 'Sent to Representative'
      });
    }

    await DistrictAuditLog.create({
      action: emailResult.success ? 'package_sent_to_representative' : 'representative_delivery_failure',
      submission: id,
      performedBy: admin.name || admin.email,
      details: {
        studentCount: students.length,
        recipientEmail: submission.representativeEmail,
        packageId: pkg._id,
        messageId: emailResult.messageId || null,
        error: emailResult.error || null
      }
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send package email',
        details: emailResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      packageId: pkg._id,
      studentCount: students.length,
      sentTo: submission.representativeEmail,
      messageId: emailResult.messageId
    });
  } catch (error) {
    console.error('Error sending district package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
