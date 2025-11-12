import mongoose from 'mongoose';

const CouponUsageSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  couponCode: {
    type: String,
    required: true,
    uppercase: true
  },
  planType: {
    type: String,
    required: true,
    enum: ['recordings_only', 'office_hours_only', 'complete']
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  paymentStatus: {
    type: String,
    enum: ['free', 'paid', 'pending', 'failed'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
CouponUsageSchema.index({ coupon: 1, usedAt: -1 });
CouponUsageSchema.index({ student: 1, usedAt: -1 });
CouponUsageSchema.index({ couponCode: 1, usedAt: -1 });
CouponUsageSchema.index({ paymentStatus: 1 });

// Virtual for checking if this was a free purchase (100% discount)
CouponUsageSchema.virtual('isFree').get(function() {
  return this.finalAmount === 0;
});

// Static method to get usage statistics for a coupon
CouponUsageSchema.statics.getCouponStats = async function(couponId) {
  const stats = await this.aggregate([
    { $match: { coupon: new mongoose.Types.ObjectId(couponId) } },
    {
      $group: {
        _id: null,
        totalUsages: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalRevenue: { $sum: '$finalAmount' },
        freeUsages: { 
          $sum: { $cond: [{ $eq: ['$finalAmount', 0] }, 1, 0] } 
        },
        paidUsages: { 
          $sum: { $cond: [{ $gt: ['$finalAmount', 0] }, 1, 0] } 
        }
      }
    }
  ]);

  return stats[0] || {
    totalUsages: 0,
    totalDiscount: 0,
    totalRevenue: 0,
    freeUsages: 0,
    paidUsages: 0
  };
};

// Static method to get overall coupon usage statistics
CouponUsageSchema.statics.getOverallStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsages: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalRevenue: { $sum: '$finalAmount' },
        averageDiscount: { $avg: '$discountPercentage' }
      }
    }
  ]);

  return stats[0] || {
    totalUsages: 0,
    totalDiscount: 0,
    totalRevenue: 0,
    averageDiscount: 0
  };
};

export default mongoose.models.CouponUsage || mongoose.model('CouponUsage', CouponUsageSchema);
