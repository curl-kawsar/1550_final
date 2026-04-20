import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictAuditLog from '@/models/DistrictAuditLog';

export async function GET(request) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const action = searchParams.get('action');

    const query = {};
    if (submissionId) query.submission = submissionId;
    if (action) query.action = action;

    const total = await DistrictAuditLog.countDocuments(query);
    const logs = await DistrictAuditLog.find(query)
      .sort('-timestamp')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching district audit log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
