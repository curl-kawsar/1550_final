import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatMessage from '@/models/Chat';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

// Get chat messages for a conversation
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    
    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      );
    }

    // Get chat messages for the student
    const messages = await ChatMessage.find({ studentEmail })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    // Add formatted timestamps
    const formattedMessages = messages.map(msg => ({
      ...msg,
      formattedTime: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      formattedDate: new Date(msg.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Send a new chat message
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { message, sender, studentEmail, adminName } = body;

    // Validate required fields
    if (!message || !sender || !studentEmail) {
      return NextResponse.json(
        { error: 'Message, sender, and studentEmail are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(sender)) {
      return NextResponse.json(
        { error: 'Sender must be either "student" or "admin"' },
        { status: 400 }
      );
    }

    if (sender === 'admin' && !adminName) {
      return NextResponse.json(
        { error: 'Admin name is required for admin messages' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await Student.findOne({ email: studentEmail.toLowerCase() });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // If message is from student, verify JWT token
    if (sender === 'student') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization required for student messages' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== studentEmail) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    // Create new chat message
    const chatMessage = new ChatMessage({
      studentId: student._id,
      studentEmail: studentEmail.toLowerCase(),
      message: message.trim(),
      sender,
      adminName: sender === 'admin' ? adminName : undefined,
      status: 'sent',
      messageType: 'text'
    });

    await chatMessage.save();

    // Mark previous messages from the other party as read
    if (sender === 'student') {
      await ChatMessage.markAsRead(studentEmail.toLowerCase(), 'admin');
    } else {
      await ChatMessage.markAsRead(studentEmail.toLowerCase(), 'student');
    }

    // Return the created message with formatted timestamps
    const responseMessage = {
      ...chatMessage.toObject(),
      formattedTime: chatMessage.createdAt.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      formattedDate: chatMessage.createdAt.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    };

    return NextResponse.json({
      success: true,
      message: responseMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}