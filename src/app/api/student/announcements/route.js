import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('student-token')?.value ||
                  request.cookies.get('token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Announcement student token error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Student announcements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

