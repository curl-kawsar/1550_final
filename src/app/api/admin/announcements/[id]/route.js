import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Announcement from '@/models/Announcement';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const authenticateAdmin = async (request) => {
  const cookieStore = await cookies();
  let token = cookieStore.get('admin-token')?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Admin announcement delete auth error:', error);
    return null;
  }
};

export async function DELETE(request, context) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = (await context?.params) || {};
    if (!id) {
      return NextResponse.json({ error: 'Announcement id is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Announcements DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}

