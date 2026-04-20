import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictEmailTemplate from '@/models/DistrictEmailTemplate';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function GET(request) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const approvedOnly = searchParams.get('approvedOnly') === 'true';

    const query = {};
    if (activeOnly) query.isActive = true;
    if (approvedOnly) query.isApproved = true;

    const templates = await DistrictEmailTemplate.find(query)
      .sort('-createdAt')
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching district templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, subject, body: templateBody, isApproved } = body;

    if (!name?.trim() || !subject?.trim() || !templateBody?.trim()) {
      return NextResponse.json({
        error: 'Name, subject, and body are required'
      }, { status: 400 });
    }

    const template = await DistrictEmailTemplate.create({
      name: name.trim(),
      subject: subject.trim(),
      body: templateBody,
      isApproved: isApproved || false,
      createdBy: admin.id
    });

    await DistrictAuditLog.create({
      action: 'template_created',
      performedBy: admin.name || admin.email,
      details: { templateName: template.name, templateId: template._id }
    });

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    console.error('Error creating district template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
