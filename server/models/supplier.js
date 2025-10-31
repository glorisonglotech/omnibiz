const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  category: {
    type: String,
    enum: ['Raw Materials', 'Finished Goods', 'Services', 'Equipment', 'Office Supplies', 'Other'],
    default: 'Other'
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  notes: {
    type: String
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
supplierSchema.index({ userId: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ category: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);

