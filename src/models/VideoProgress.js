import mongoose from 'mongoose';

const videoProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  structureId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  watchedDuration: {
    type: Number, // in seconds
    default: 0
  },
  totalDuration: {
    type: Number, // in seconds
    default: 0
  },
  watchedPercentage: {
    type: Number, // 0-100
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
videoProgressSchema.index({ studentId: 1, videoId: 1 }, { unique: true });
videoProgressSchema.index({ studentId: 1, moduleId: 1 });
videoProgressSchema.index({ studentId: 1, structureId: 1 });

// Static method to get student's progress for all videos
videoProgressSchema.statics.getStudentProgress = async function(studentId) {
  return await this.find({ studentId }).sort({ createdAt: 1 });
};

// Static method to check if a video is unlocked for a student
videoProgressSchema.statics.isVideoUnlocked = async function(studentId, videoId, moduleId, allVideos) {
  // First video in the module is always unlocked
  const moduleVideos = allVideos.filter(v => v.moduleId.toString() === moduleId.toString());
  const sortedVideos = moduleVideos.sort((a, b) => a.order - b.order);
  
  if (sortedVideos.length === 0) return false;
  
  // If this is the first video in the module, it's unlocked
  if (sortedVideos[0]._id.toString() === videoId.toString()) {
    return true;
  }
  
  // Find the position of current video
  const currentVideoIndex = sortedVideos.findIndex(v => v._id.toString() === videoId.toString());
  if (currentVideoIndex === -1) return false;
  
  // Check if the previous video is completed
  const previousVideo = sortedVideos[currentVideoIndex - 1];
  if (!previousVideo) return false;
  
  const previousProgress = await this.findOne({
    studentId,
    videoId: previousVideo._id,
    isCompleted: true
  });
  
  return !!previousProgress;
};

// Static method to mark video as completed
videoProgressSchema.statics.markVideoCompleted = async function(studentId, videoId, moduleId, structureId, watchData = {}) {
  const progress = await this.findOneAndUpdate(
    { studentId, videoId },
    {
      studentId,
      videoId,
      moduleId,
      structureId,
      isCompleted: true,
      completedAt: new Date(),
      ...watchData
    },
    { upsert: true, new: true }
  );
  
  return progress;
};

// Instance method to calculate completion percentage
videoProgressSchema.methods.getCompletionPercentage = function() {
  if (!this.totalDuration || this.totalDuration === 0) return 0;
  return Math.min(100, Math.round((this.watchedDuration / this.totalDuration) * 100));
};

const VideoProgress = mongoose.models.VideoProgress || mongoose.model('VideoProgress', videoProgressSchema);

export default VideoProgress;
