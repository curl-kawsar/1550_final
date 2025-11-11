import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  embedCode: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
VideoSchema.index({ module: 1, isActive: 1, sortOrder: 1 });
VideoSchema.index({ isActive: 1 });

// Static method to get videos for a module
VideoSchema.statics.getVideosByModule = function(moduleId) {
  return this.find({ 
    module: moduleId, 
    isActive: true 
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

// Static method to get all active videos with module and class structure info
VideoSchema.statics.getActiveVideosWithDetails = function() {
  return this.find({ isActive: true })
    .populate({
      path: 'module',
      populate: {
        path: 'classStructure',
        select: 'title'
      }
    })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

// Method to extract video ID from embed code for thumbnail purposes
VideoSchema.methods.getVideoId = function() {
  try {
    // Extract video ID from Streamable embed code
    const match = this.embedCode.match(/streamable\.com\/e\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
