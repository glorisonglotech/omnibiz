const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'buy_x_get_y', 'seasonal'],
    required: true,
    default: 'percentage'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSeasonalPromotion: {
    type: Boolean,
    default: false
  },
  seasonalDetails: {
    seasonName: String, // e.g., 'Black Friday', 'Christmas Sale', 'Summer Sale'
    bannerImage: String,
    bannerText: String,
    priority: { type: Number, default: 0 } // Higher priority shows first
  },
  applicableTo: {
    type: String,
    enum: ['all', 'products', 'services', 'specific_items', 'categories'],
    default: 'all'
  },
  applicableItems: [{
    itemType: { type: String, enum: ['product', 'service'] },
    itemId: { type: mongoose.Schema.Types.ObjectId }
  }],
  applicableProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  applicableServices: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service' 
  }],
  applicableCategories: [String],
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: Number,
  usageLimit: {
    total: Number, // Total times this discount can be used
    perCustomer: { type: Number, default: 1 } // Times per customer
  },
  usageCount: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  showOnStorefront: {
    type: Boolean,
    default: true
  },
  showNewArrivalsBadge: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  termsAndConditions: String,
  customerSegment: {
    type: String,
    enum: ['all', 'new', 'returning', 'vip'],
    default: 'all'
  },
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    redemptions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
discountSchema.index({ userId: 1, isActive: 1 });
discountSchema.index({ code: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });
discountSchema.index({ isSeasonalPromotion: 1, showOnStorefront: 1 });

// Virtual: Check if discount is currently valid
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.usageLimit.total === undefined || this.usageCount < this.usageLimit.total);
});

// Method: Check if customer can use this discount
discountSchema.methods.canBeUsedBy = function(customerId, customerType = 'returning') {
  if (!this.isValid) return false;
  
  // Check customer segment
  if (this.customerSegment !== 'all') {
    if (this.customerSegment !== customerType) return false;
  }
  
  return true;
};

// Method: Calculate discount amount
discountSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minPurchaseAmount) return 0;
  
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = (orderAmount * this.value) / 100;
      break;
    case 'fixed':
      discountAmount = this.value;
      break;
    default:
      discountAmount = 0;
  }
  
  // Apply max discount cap if set
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount;
  }
  
  return Math.min(discountAmount, orderAmount);
};

module.exports = mongoose.model('Discount', discountSchema);
