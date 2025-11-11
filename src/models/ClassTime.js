import mongoose from 'mongoose';

const ClassTimeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  dayOfWeek: {
    type: [String],
    required: true,
    validate: {
      validator: function(days) {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.every(day => validDays.includes(day)) && days.length > 0;
      },
      message: 'Invalid day of week'
    }
  },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  endTime: {
    type: String,
    required: true,
    trim: true
  },
  timezone: {
    type: String,
    required: true,
    default: 'Pacific',
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 50
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumRequired: {
    type: Number,
    default: 40,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // For sorting and display purposes
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ClassTimeSchema.index({ isActive: 1, sortOrder: 1 });
// Note: name field already has unique index from unique: true

// Virtual for display name (formatted for UI)
ClassTimeSchema.virtual('displayName').get(function() {
  const days = this.dayOfWeek.join(' & ');
  return `${days} - ${this.startTime} ${this.timezone}`;
});

// Virtual to check if class has minimum enrollment
ClassTimeSchema.virtual('hasMinimumEnrollment').get(function() {
  return this.currentEnrollment >= this.minimumRequired;
});

// Virtual for enrollment status
ClassTimeSchema.virtual('enrollmentStatus').get(function() {
  if (this.currentEnrollment >= this.capacity) return 'Full';
  if (this.currentEnrollment >= this.minimumRequired) return 'Available';
  return 'Needs More Students';
});

// Method to update enrollment count
ClassTimeSchema.methods.updateEnrollmentCount = async function() {
  const Student = mongoose.model('Student');
  const count = await Student.countDocuments({ 
    classTime: this.name,
    status: { $ne: 'cancelled' } // Don't count cancelled students
  });
  this.currentEnrollment = count;
  return this.save();
};

// Static method to get active class times for registration
ClassTimeSchema.statics.getActiveClassTimes = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

// Static method to get enrollment statistics
ClassTimeSchema.statics.getEnrollmentStats = async function() {
  const Student = mongoose.model('Student');
  
  const classTimes = await this.find({ isActive: true }).lean();
  const enrollments = {};
  
  for (const classTime of classTimes) {
    const count = await Student.countDocuments({ 
      classTime: classTime.name,
      status: { $ne: 'cancelled' }
    });
    enrollments[classTime.name] = count;
  }
  
  return {
    enrollments,
    minimumRequired: classTimes[0]?.minimumRequired || 40
  };
};

export default mongoose.models.ClassTime || mongoose.model('ClassTime', ClassTimeSchema);
