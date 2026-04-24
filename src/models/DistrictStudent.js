import mongoose from 'mongoose';

const DistrictStudentSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictSubmission',
    required: true
  },
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
  grade: {
    type: String,
    required: true,
    trim: true
  },
  highSchoolName: {
    type: String,
    trim: true,
    default: ''
  },
  parentFirstName: {
    type: String,
    required: true,
    trim: true
  },
  parentLastName: {
    type: String,
    required: true,
    trim: true
  },
  parentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  registrationCode: {
    type: String,
    trim: true,
    default: ''
  },
  registrationLink: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Imported',
      'Ready for Generation',
      'Generated',
      'Included in Package',
      'Sent to Representative',
      'Registered',
      'Skipped',
      'Delivery Issue',
      'Link Opened',
      'Claim Started',
      'Claim Completed',
      'Opt-In Pending',
      'Opt-In Confirmed',
      'Duplicate Review',
      'Merged'
    ],
    default: 'Draft'
  },
  generatedEmailContent: {
    type: String,
    default: ''
  },
  districtOriginTag: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // No default: if we stored null, MongoDB's unique+sparse index could still allow
  // only one document with "claimToken: null" per index rules—breaking bulk import.
  // Omit the field until generate-claim-links sets a real token.
  claimToken: {
    type: String,
    unique: true,
    sparse: true
  },
  claimTokenExpiresAt: {
    type: Date,
    default: null
  },
  claimStatus: {
    type: String,
    enum: ['none', 'link_opened', 'claim_started', 'claim_completed'],
    default: 'none'
  },
  claimOpenedAt: { type: Date, default: null },
  claimStartedAt: { type: Date, default: null },
  claimCompletedAt: { type: Date, default: null },
  duplicateCheckStatus: {
    type: String,
    enum: ['none', 'clean', 'flagged', 'merged'],
    default: 'none'
  },
  mergeStatus: {
    type: String,
    trim: true,
    default: ''
  },
  convertedStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  optInStatus: {
    type: String,
    enum: ['none', 'pending', 'confirmed', 'declined'],
    default: 'none'
  },
  dashboardActivated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

DistrictStudentSchema.index({ submission: 1 });
DistrictStudentSchema.index({ status: 1 });
DistrictStudentSchema.index({ parentEmail: 1 });
DistrictStudentSchema.index({ claimToken: 1 });

export default mongoose.models.DistrictStudent || mongoose.model('DistrictStudent', DistrictStudentSchema);
