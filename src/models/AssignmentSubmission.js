import mongoose from 'mongoose';

const SubmissionAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  answers: [SubmissionAnswerSchema],
  score: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeSpent: { type: Number, required: true }, // in seconds
  submittedAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one submission per student per assignment
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Index for efficient queries
AssignmentSubmissionSchema.index({ studentEmail: 1, submittedAt: -1 });
AssignmentSubmissionSchema.index({ assignmentId: 1, submittedAt: -1 });

// Virtual for grade letter
AssignmentSubmissionSchema.virtual('grade').get(function() {
  if (this.percentage >= 90) return 'A';
  if (this.percentage >= 80) return 'B';
  if (this.percentage >= 70) return 'C';
  if (this.percentage >= 60) return 'D';
  return 'F';
});

// Static method to calculate and create submission
AssignmentSubmissionSchema.statics.createSubmission = async function(assignmentId, studentId, studentEmail, submissionAnswers, timeSpent) {
  const Assignment = mongoose.model('Assignment');
  const assignment = await Assignment.findById(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // Check if student already submitted
  const existingSubmission = await this.findOne({ assignmentId, studentId });
  if (existingSubmission) {
    throw new Error('Assignment already submitted');
  }

  // Calculate results
  const answers = [];
  let correctAnswers = 0;

  assignment.questions.forEach((question, index) => {
    const studentAnswer = submissionAnswers[index];
    const isCorrect = studentAnswer === question.answer;
    
    if (isCorrect) correctAnswers++;

    answers.push({
      questionId: question._id,
      selectedAnswer: studentAnswer,
      correctAnswer: question.answer,
      isCorrect
    });
  });

  const totalQuestions = assignment.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Create submission
  const submission = new this({
    assignmentId,
    studentId,
    studentEmail,
    answers,
    score: correctAnswers,
    percentage,
    totalQuestions,
    correctAnswers,
    timeSpent
  });

  return await submission.save();
};

// Static method to get student results
AssignmentSubmissionSchema.statics.getStudentResults = function(studentId) {
  return this.find({ studentId })
    .populate('assignmentId', 'title description createdAt')
    .sort({ submittedAt: -1 });
};

// Static method to get assignment results (for admin)
AssignmentSubmissionSchema.statics.getAssignmentResults = function(assignmentId) {
  return this.find({ assignmentId })
    .populate('studentId', 'firstName lastName email')
    .sort({ submittedAt: -1 });
};

const AssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);
export default AssignmentSubmission;
