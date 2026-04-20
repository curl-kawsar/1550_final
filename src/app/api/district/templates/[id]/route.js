import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictEmailTemplate from '@/models/DistrictEmailTemplate';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function GET(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const template = await DistrictEmailTemplate.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching district template:', error);
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

    const allowedFields = ['name', 'subject', 'body', 'isActive', 'isApproved'];
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    const template = await DistrictEmailTemplate.findByIdAndUpdate(id, update, { new: true });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await DistrictAuditLog.create({
      action: 'template_updated',
      performedBy: admin.name || admin.email,
      details: { templateId: id, updatedFields: Object.keys(update) }
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error updating district template:', error);
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
    const { id } = await params;

    const template = await DistrictEmailTemplate.findByIdAndDelete(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await DistrictAuditLog.create({
      action: 'template_deleted',
      performedBy: admin.name || admin.email,
      details: { templateName: template.name, templateId: id }
    });

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting district template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
