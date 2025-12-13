import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  // Student Information
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  graduationYear: {
    type: Number,
    required: true,
    min: 2010,
    max: 2035
  },
  highSchoolName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  topCollegeChoices: {
    type: String,
    required: false,
    trim: true
  },

  // Parent Information
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
  parentPhoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },

  // Academic Information
  currentGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  classRigor: {
    type: String,
    required: true,
    enum: ['Mostly Honors and AP', 'Some Honors and AP', 'No Honors or AP']
  },
  universitiesWant: {
    type: String,
    required: true,
    enum: ['Ivy League/Top 20', 'Top 50', 'Top 100', 'Selective State University', 'Anywhere I can']
  },

  // Academic Information Part 2
  satActScores: {
    type: String,
    required: false,
    trim: true
  },
  typeOfStudent: {
    type: String,
    required: true,
    enum: [
      'I usually wait until the last minute to get things done. Motivated sometimes, but inconsistent.',
      'I generally bring my stuff and finish on time, but I don\'t always get top results.',
      'I am usually very slow to work and achieve awesome results. I get stressed if I don\'t succeed!'
    ],
    trim: true
  },
  biggestStressor: {
    type: String,
    required: false,
    trim: true
  },
  parentWorry: {
    type: String,
    required: false,
    trim: true
  },
  registrationCode: {
    type: String,
    required: true,
    trim: true
  },
  // Ambassador Assignment
  ambassador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambassador',
    default: null
  },
  
  // Class Schedule Information
  classTime: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: async function(value) {
        // Allow any string during initial migration
        if (!value) return false;
        
        try {
          const ClassTime = mongoose.model('ClassTime');
          const classTime = await ClassTime.findOne({ 
            name: value, 
            isActive: true 
          });
          return !!classTime;
        } catch (error) {
          // During initial setup, allow the hardcoded values
          const legacyValues = [
            'Mon & Wed - 4:00 PM Pacific',
            'Mon & Wed - 7:00 PM Pacific',
            'Tue & Thu - 4:00 PM Pacific',
            'Tue & Thu - 7:00 PM Pacific'
          ];
          return legacyValues.includes(value);
        }
      },
      message: 'Invalid class time selection'
    }
  },
  diagnosticTestDate: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: async function(value) {
        // Allow any string during initial migration
        if (!value) return false;
        
        try {
          const DiagnosticTest = mongoose.model('DiagnosticTest');
          const test = await DiagnosticTest.findOne({ 
            name: value, 
            isActive: true 
          });
          return !!test;
        } catch (error) {
          // During initial setup, allow the hardcoded values
          const legacyValues = [
            'Saturday September 27th 8:30am - noon PST',
            'Sunday September 28th 8:30am - noon PST',
            'I can\'t make either of these dates (reply below with if neither option works for you)',
            'I can\'t make any of these dates'
          ];
          return legacyValues.includes(value);
        }
      },
      message: 'Invalid diagnostic test selection'
    }
  },
  
  // Schedule Change Tracking
  classTimeChangeCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 2
  },
  diagnosticTestChangeCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 2
  },
  classTimeChangeHistory: [{
    from: String,
    to: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  diagnosticTestChangeHistory: [{
    from: String,
    to: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Parental Approval
  parentalApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  parentalApprovalToken: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    default: undefined // Use undefined instead of null for sparse index
  },
  parentalApprovedAt: {
    type: Date
  },
  parentalApprovalEmailSent: {
    type: Boolean,
    default: false
  },

  // Trafft Integration
  trafftCustomerId: {
    type: String,
    required: false
  },
  trafftCustomerCreated: {
    type: Boolean,
    default: false
  },
  trafftError: {
    type: String,
    required: false
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'contacted'],
    default: 'pending'
  },

  // Payment and access control
  hasPaidSpecialOffer: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: {
    type: String,
    trim: true,
    default: ''
  },
  stripePaymentIntentId: {
    type: String,
    trim: true,
    default: ''
  },
  paymentDate: {
    type: Date
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },

  // Password Reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
// Note: email index is automatically created by unique: true
StudentSchema.index({ submittedAt: -1 });
StudentSchema.index({ status: 1 });
StudentSchema.index({ classTime: 1 }); // For enrollment counting
StudentSchema.index({ hasPaidSpecialOffer: 1 }); // For access control
StudentSchema.index({ stripeCustomerId: 1 }); // For payment processing

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);