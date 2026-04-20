import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictStudent from '@/models/DistrictStudent';

export async function GET(request, { params }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query = { submission: id };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { parentEmail: { $regex: search, $options: 'i' } },
        { parentFirstName: { $regex: search, $options: 'i' } },
        { parentLastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const total = await DistrictStudent.countDocuments(query);
    const students = await DistrictStudent.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching district students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
