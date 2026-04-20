import mongoose from 'mongoose';

const DistrictPackageSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictSubmission',
    required: true
  },
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictEmailTemplate',
    required: true
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date,
    default: null
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['created', 'sent', 'delivery_failed'],
    default: 'created'
  }
}, {
  timestamps: true
});

DistrictPackageSchema.index({ submission: 1 });
DistrictPackageSchema.index({ status: 1 });

export default mongoose.models.DistrictPackage || mongoose.model('DistrictPackage', DistrictPackageSchema);
