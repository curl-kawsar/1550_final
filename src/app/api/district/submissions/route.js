import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';

export async function GET(request) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    const query = {};
    if (search) {
      query.$or = [
        { districtName: { $regex: search, $options: 'i' } },
        { schoolName: { $regex: search, $options: 'i' } },
        { representativeName: { $regex: search, $options: 'i' } },
        { representativeEmail: { $regex: search, $options: 'i' } },
        { registrationCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const total = await DistrictSubmission.countDocuments(query);
    const submissions = await DistrictSubmission.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching district submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
