import mongoose from 'mongoose';

const DistrictAuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'district_registration_submitted',
      'district_record_created',
      'student_nominee_edited',
      'csv_uploaded',
      'csv_validation_result',
      'partial_csv_import_completed',
      'email_preview_generated',
      'package_preview_generated',
      'student_email_files_generated',
      'package_sent_to_representative',
      'package_resend_action',
      'representative_delivery_failure',
      'student_converted_to_registered',
      'district_record_archived',
      'student_removed',
      'template_created',
      'template_updated',
      'template_deleted',
      'submission_status_changed',
      'claim_link_generated',
      'claim_link_opened',
      'claim_started',
      'claim_completed',
      'duplicate_review_triggered',
      'merge_completed',
      'optin_sent',
      'optin_confirmed',
      'dashboard_activated'
    ]
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictSubmission',
    default: null
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictStudent',
    default: null
  },
  performedBy: {
    type: String,
    required: true,
    default: 'system'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

DistrictAuditLogSchema.index({ submission: 1 });
DistrictAuditLogSchema.index({ timestamp: -1 });
DistrictAuditLogSchema.index({ action: 1 });

export default mongoose.models.DistrictAuditLog || mongoose.model('DistrictAuditLog', DistrictAuditLogSchema);
