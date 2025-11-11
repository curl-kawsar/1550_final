import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
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
  classStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassStructure',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  },
  objectives: {
    type: [String],
    default: []
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
ModuleSchema.index({ classStructure: 1, isActive: 1, sortOrder: 1 });
ModuleSchema.index({ isActive: 1 });

// Static method to get modules for a class structure
ModuleSchema.statics.getModulesByClassStructure = function(classStructureId) {
  return this.find({ 
    classStructure: classStructureId, 
    isActive: true 
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

// Static method to get all active modules with class structure info
ModuleSchema.statics.getActiveModulesWithStructure = function() {
  return this.find({ isActive: true })
    .populate('classStructure', 'title')
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);
