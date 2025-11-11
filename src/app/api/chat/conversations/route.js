import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatMessage from '@/models/Chat';

// Get all conversations for admin
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get conversation summary using the static method
    const conversations = await ChatMessage.getConversationSummary();

    return NextResponse.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}