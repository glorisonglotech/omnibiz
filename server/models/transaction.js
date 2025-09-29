const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: {
    type: String,
    enum: [
      'sales', 'service', 'consultation', 'product', 'other_income',
      'office', 'marketing', 'transport', 'utilities', 'supplies', 'other_expense'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  reference: String, // Invoice ID, Order ID, etc.
  notes: String
}, { timestamps: true });

// Index for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
