import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  // Student who sent/received the message
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // Student email for easier querying
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // Message content
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // Who sent the message: 'student' or 'admin'
  sender: {
    type: String,
    required: true,
    enum: ['student', 'admin']
  },
  // Admin name if sent by admin
  adminName: {
    type: String,
    required: function() { return this.sender === 'admin'; },
    trim: true
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // Read timestamp
  readAt: {
    type: Date
  },
  // Message type for future extensions
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ChatMessageSchema.index({ studentEmail: 1, createdAt: -1 }); // For conversation history
ChatMessageSchema.index({ studentId: 1, createdAt: -1 }); // Alternative index
ChatMessageSchema.index({ createdAt: -1 }); // For admin to see latest messages
ChatMessageSchema.index({ status: 1, sender: 1 }); // For unread message counts

// Virtual for formatted timestamp
ChatMessageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
});

// Virtual for formatted date
ChatMessageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
});

// Static method to get conversation summary for admin
ChatMessageSchema.statics.getConversationSummary = async function() {
  return await this.aggregate([
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$studentEmail',
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$createdAt' },
        lastSender: { $first: '$sender' },
        studentId: { $first: '$studentId' },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$sender', 'student'] },
                  { $eq: ['$status', 'sent'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $project: {
        studentEmail: '$_id',
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        lastMessage: 1,
        lastMessageTime: 1,
        lastSender: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);
};

// Static method to mark messages as read
ChatMessageSchema.statics.markAsRead = async function(studentEmail, sender) {
  return await this.updateMany(
    { 
      studentEmail: studentEmail,
      sender: sender,
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);