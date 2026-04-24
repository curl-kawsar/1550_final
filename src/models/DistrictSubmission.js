import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const DistrictSubmissionSchema = new mongoose.Schema({
  districtName: {
    type: String,
    required: true,
    trim: true
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  districtSource: {
    type: String,
    trim: true,
    default: ''
  },
  representativeName: {
    type: String,
    required: true,
    trim: true
  },
  representativeRole: {
    type: String,
    trim: true,
    default: ''
  },
  representativeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  representativePhone: {
    type: String,
    trim: true,
    default: ''
  },
  studentCount: {
    type: Number,
    required: true,
    min: 5
  },
  submissionMethod: {
    type: String,
    enum: ['manual', 'csv', 'mixed'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  confirmationChecked: {
    type: Boolean,
    default: false
  },
  registrationCode: {
    type: String,
    unique: true,
    default: () => `DIST-${nanoid(8).toUpperCase()}`
  },
  status: {
    type: String,
    enum: [
      'New',
      'Under Review',
      'Ready for Generation',
      'Package In Progress',
      'Sent to Representative',
      'Partially Converted',
      'Completed',
      'Archived'
    ],
    default: 'New'
  },
  totalGenerated: { type: Number, default: 0 },
  totalPackaged: { type: Number, default: 0 },
  totalSentToRep: { type: Number, default: 0 },
  totalRegistered: { type: Number, default: 0 }
}, {
  timestamps: true
});

DistrictSubmissionSchema.index({ districtName: 1, schoolName: 1 }, { unique: true });
DistrictSubmissionSchema.index({ status: 1 });
DistrictSubmissionSchema.index({ createdAt: -1 });

export default mongoose.models.DistrictSubmission || mongoose.model('DistrictSubmission', DistrictSubmissionSchema);
