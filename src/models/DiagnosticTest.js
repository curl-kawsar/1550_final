import mongoose from 'mongoose';

const DiagnosticTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
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
    default: 'PST',
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    trim: true,
    default: 'Online'
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
  instructions: {
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
  },
  // Test duration in minutes
  duration: {
    type: Number,
    default: 210, // 3.5 hours = 210 minutes
    min: 1
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
DiagnosticTestSchema.index({ isActive: 1, date: 1, sortOrder: 1 });
DiagnosticTestSchema.index({ date: 1 });
// Note: name field already has unique index from unique: true

// Virtual for display name (formatted for UI)
DiagnosticTestSchema.virtual('displayName').get(function() {
  const dateStr = this.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric'
  });
  return `${dateStr} ${this.startTime} - ${this.endTime} ${this.timezone}`;
});

// Virtual for formatted date
DiagnosticTestSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time range
DiagnosticTestSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime} ${this.timezone}`;
});

// Virtual to check if test is full
DiagnosticTestSchema.virtual('isFull').get(function() {
  return this.currentEnrollment >= this.capacity;
});

// Virtual for enrollment status
DiagnosticTestSchema.virtual('enrollmentStatus').get(function() {
  if (this.currentEnrollment >= this.capacity) return 'Full';
  if (this.date < new Date()) return 'Past';
  return 'Available';
});

// Virtual to check if test is upcoming
DiagnosticTestSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

// Method to update enrollment count
DiagnosticTestSchema.methods.updateEnrollmentCount = async function() {
  const Student = mongoose.model('Student');
  const count = await Student.countDocuments({ 
    diagnosticTestDate: this.name,
    status: { $ne: 'cancelled' } // Don't count cancelled students
  });
  this.currentEnrollment = count;
  return this.save();
};

// Static method to get active diagnostic tests for registration
DiagnosticTestSchema.statics.getActiveDiagnosticTests = function() {
  return this.find({ 
    isActive: true,
    date: { $gte: new Date() } // Only future tests
  })
    .sort({ sortOrder: 1, date: 1 })
    .lean();
};

// Static method to get all diagnostic tests (including past ones) for admin
DiagnosticTestSchema.statics.getAllDiagnosticTests = function() {
  return this.find({})
    .sort({ date: -1, sortOrder: 1 }) // Most recent first
    .lean();
};

// Static method to get enrollment statistics
DiagnosticTestSchema.statics.getEnrollmentStats = async function() {
  const Student = mongoose.model('Student');
  
  const diagnosticTests = await this.find({ isActive: true }).lean();
  const enrollments = {};
  
  for (const test of diagnosticTests) {
    const count = await Student.countDocuments({ 
      diagnosticTestDate: test.name,
      status: { $ne: 'cancelled' }
    });
    enrollments[test.name] = count;
  }
  
  return {
    enrollments,
    tests: diagnosticTests
  };
};

// Method to check if student can register
DiagnosticTestSchema.methods.canRegister = function() {
  return this.isActive && 
         this.isUpcoming && 
         this.currentEnrollment < this.capacity;
};

export default mongoose.models.DiagnosticTest || mongoose.model('DiagnosticTest', DiagnosticTestSchema);
