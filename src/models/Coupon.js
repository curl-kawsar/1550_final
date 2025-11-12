import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  applicablePlans: {
    type: [String],
    enum: ['recordings_only', 'office_hours_only', 'complete', 'all'],
    default: ['all']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ createdBy: 1 });

// Virtual for checking if coupon is currently valid
CouponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if coupon can be applied to a specific plan
CouponSchema.methods.canApplyToPlan = function(planType) {
  return this.applicablePlans.includes('all') || this.applicablePlans.includes(planType);
};

// Method to calculate discount amount
CouponSchema.methods.calculateDiscount = function(originalAmount) {
  if (originalAmount < this.minimumAmount) {
    return 0;
  }
  return Math.round((originalAmount * this.discountPercentage) / 100);
};

// Static method to find valid coupon by code
CouponSchema.statics.findValidCoupon = async function(code, planType = 'all', amount = 0) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });

  if (!coupon) {
    return null;
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return null;
  }

  // Check minimum amount
  if (amount < coupon.minimumAmount) {
    return null;
  }

  // Check applicable plans
  if (!coupon.canApplyToPlan(planType)) {
    return null;
  }

  return coupon;
};

// Method to increment usage count
CouponSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  return this.save();
};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
