import mongoose from 'mongoose';

const ClassStructureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  overview: {
    type: String,
    required: true,
    trim: true
  },
  description: {
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // Access control
  requiresPayment: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ClassStructureSchema.index({ isActive: 1, sortOrder: 1 });
ClassStructureSchema.index({ requiresPayment: 1 });

// Static method to get active class structures
ClassStructureSchema.statics.getActiveStructures = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

export default mongoose.models.ClassStructure || mongoose.model('ClassStructure', ClassStructureSchema);
