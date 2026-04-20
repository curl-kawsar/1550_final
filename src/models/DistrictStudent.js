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
      'Delivery Issue'
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
  }
}, {
  timestamps: true
});

DistrictStudentSchema.index({ submission: 1 });
DistrictStudentSchema.index({ status: 1 });
DistrictStudentSchema.index({ parentEmail: 1 });

export default mongoose.models.DistrictStudent || mongoose.model('DistrictStudent', DistrictStudentSchema);
