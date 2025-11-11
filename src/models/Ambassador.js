import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const AmbassadorSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    required: true
  },
  ambassadorCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0, // Commission percentage or amount
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Generate unique ambassador code
AmbassadorSchema.statics.generateAmbassadorCode = async function() {
  let code
  let isUnique = false
  
  while (!isUnique) {
    // Generate 6-character code with letters and numbers
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const existing = await this.findOne({ ambassadorCode: code })
    if (!existing) {
      isUnique = true
    }
  }
  
  return code
}

// Hash password before saving
AmbassadorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcryptjs.genSalt(12)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
AmbassadorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password)
}

// Update student count
AmbassadorSchema.methods.updateStudentCount = async function() {
  const Student = mongoose.model('Student')
  const count = await Student.countDocuments({ ambassador: this._id })
  this.totalStudents = count
  return this.save()
}

export default mongoose.models.Ambassador || mongoose.model('Ambassador', AmbassadorSchema)