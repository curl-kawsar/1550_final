import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import Student from '@/models/Student';
import { sendAnnouncementEmail } from '@/lib/emailService';

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

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Admin announcement auth error:', error);
    return null;
  }
};

export async function GET(request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, sendEmail = true } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    await connectToDatabase();

    const announcement = await Announcement.create({
      title,
      message,
      audience: 'all',
      sendEmail,
      createdBy: admin.adminId || admin.id,
    });

    let emailResult = null;

    if (sendEmail) {
      const students = await Student.find({}, 'email parentEmail').lean();
      const recipients = new Set();

      students.forEach((s) => {
        if (s.email) recipients.add(s.email.toLowerCase());
        if (s.parentEmail) recipients.add(s.parentEmail.toLowerCase());
      });

      const recipientList = Array.from(recipients);
      emailResult = await sendAnnouncementEmail(title, message, recipientList);

      await Announcement.findByIdAndUpdate(announcement._id, {
        emailCount: emailResult?.sent || recipientList.length,
        sendEmail: true,
      });
    }

    return NextResponse.json({
      success: true,
      announcement,
      emailResult,
    });
  } catch (error) {
    console.error('Announcements POST error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

