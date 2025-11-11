import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatMessage from '@/models/Chat';

// Mark messages as read
export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { studentEmail, sender } = body;

    if (!studentEmail || !sender) {
      return NextResponse.json(
        { error: 'Student email and sender are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(sender)) {
      return NextResponse.json(
        { error: 'Sender must be either "student" or "admin"' },
        { status: 400 }
      );
    }

    // Mark messages as read
    const result = await ChatMessage.markAsRead(studentEmail.toLowerCase(), sender);

    // Log for debugging infinite loops
    if (result.modifiedCount === 0) {
      console.log(`No messages to mark as read for ${studentEmail} (${sender})`);
    } else {
      console.log(`Marked ${result.modifiedCount} messages as read for ${studentEmail} (${sender})`);
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}