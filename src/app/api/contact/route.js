import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { sendThankYouEmail, sendAdminNotification } from '@/lib/emailService';

// Contact Message Schema
const ContactMessageSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ContactMessageSchema.index({ submittedAt: -1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ email: 1 });

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const { firstName, lastName, email, message } = body;
    
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Create new contact message
    const contactMessage = new ContactMessage({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });
    
    await contactMessage.save();
    
    // Send automated emails
    try {
      // Send thank you email to the user
      const thankYouResult = await sendThankYouEmail(
        contactMessage.email,
        contactMessage.firstName,
        contactMessage.lastName
      );
      
      // Send notification email to admin
      const adminNotificationResult = await sendAdminNotification({
        firstName: contactMessage.firstName,
        lastName: contactMessage.lastName,
        email: contactMessage.email,
        message: contactMessage.message
      });
      
      console.log('Email results:', {
        thankYou: thankYouResult.success,
        adminNotification: adminNotificationResult.success
      });
      
    } catch (emailError) {
      // Log email errors but don't fail the contact form submission
      console.error('Error sending emails:', emailError);
    }
    
    return NextResponse.json(
      { 
        message: 'Thank you for your message! We will get back to you soon. Please check your email for confirmation.',
        id: contactMessage._id 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }
    
    // Get contact messages with pagination
    const messages = await ContactMessage.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await ContactMessage.countDocuments(query);
    
    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}