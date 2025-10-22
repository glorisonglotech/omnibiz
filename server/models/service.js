const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    default: '60 min'
  },
  category: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxBookingsPerSlot: {
    type: Number,
    default: 1
  },
  availableTeamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }],
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  bookings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  reviews: [{
    author: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  image: String,
  isNewArrival: {
    type: Boolean,
    default: false
  },
  newArrivalUntil: {
    type: Date
  },
  discountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discount'
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ userId: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);