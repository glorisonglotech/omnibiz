const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for guest users
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false // For registered customers
  },
  guestId: {
    type: String, // For guest users (can use session ID or device ID)
    required: false
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Store product snapshot in case product is deleted
  productSnapshot: {
    name: String,
    price: Number,
    image: String,
    category: String
  }
}, { timestamps: true });

// Compound index to prevent duplicates
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ customerId: 1, productId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ guestId: 1, productId: 1 }, { unique: true, sparse: true });

// Index for faster queries
wishlistSchema.index({ userId: 1, addedAt: -1 });
wishlistSchema.index({ customerId: 1, addedAt: -1 });
wishlistSchema.index({ guestId: 1, addedAt: -1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);

