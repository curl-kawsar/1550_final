import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  audience: {
    type: String,
    default: 'all',
  },
  sendEmail: {
    type: Boolean,
    default: true,
  },
  emailCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

