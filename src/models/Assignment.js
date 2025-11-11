import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  instruction: { type: String, trim: true, default: '' },
  optionA: { type: String, required: true, trim: true },
  optionB: { type: String, required: true, trim: true },
  optionC: { type: String, required: true, trim: true },
  optionD: { type: String, required: true, trim: true },
  answer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] }
}, { _id: true });

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: false },
  questions: [QuestionSchema],
  timeLimit: { type: Number, default: 60 }, // in minutes
  totalQuestions: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update totalQuestions whenever questions array changes
AssignmentSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  next();
});

// Virtual for assignment status
AssignmentSchema.virtual('status').get(function() {
  return this.isActive ? 'Active' : 'Inactive';
});

// Method to get questions without answers (for students)
AssignmentSchema.methods.getQuestionsForStudent = function() {
  return this.questions.map(q => ({
    _id: q._id,
    question: q.question,
    instruction: q.instruction,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD
    // Note: answer and points are intentionally excluded for security
  }));
};

// Static method to get active assignments for students
AssignmentSchema.statics.getActiveAssignments = function() {
  return this.find({ isActive: true })
    .select('title description timeLimit totalQuestions createdAt')
    .sort({ createdAt: -1 });
};

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
export default Assignment;
