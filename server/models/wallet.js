const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR', 'GBP']
  },
  // Transaction limits
  dailyLimit: {
    type: Number,
    default: 100000
  },
  perTransactionLimit: {
    type: Number,
    default: 50000
  },
  todaySpent: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  // Connected payment methods
  connectedAccounts: [{
    type: {
      type: String,
      enum: ['mpesa', 'bank', 'paypal', 'card'],
      required: true
    },
    accountName: String,
    accountNumber: String,
    provider: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Security
  pin: {
    type: String,
    select: false // Don't return pin in queries by default
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  frozenReason: String,
  frozenAt: Date,
  // Metadata
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  lastTransactionDate: Date
}, {
  timestamps: true
});

// Reset daily spending limit at midnight
walletSchema.methods.resetDailyLimitIfNeeded = function() {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.todaySpent = 0;
    this.lastResetDate = now;
  }
};

// Check if transaction is within limits
walletSchema.methods.canTransact = function(amount) {
  this.resetDailyLimitIfNeeded();
  
  if (this.isFrozen) {
    return { allowed: false, reason: 'Wallet is frozen' };
  }
  
  if (!this.isActive) {
    return { allowed: false, reason: 'Wallet is not active' };
  }
  
  if (amount > this.perTransactionLimit) {
    return { allowed: false, reason: `Transaction exceeds per-transaction limit of ${this.currency} ${this.perTransactionLimit}` };
  }
  
  if (this.todaySpent + amount > this.dailyLimit) {
    return { allowed: false, reason: `Transaction exceeds daily limit of ${this.currency} ${this.dailyLimit}` };
  }
  
  if (amount > this.balance) {
    return { allowed: false, reason: 'Insufficient balance' };
  }
  
  return { allowed: true };
};

// Credit wallet (add funds)
walletSchema.methods.credit = async function(amount, source = 'deposit') {
  if (amount <= 0) throw new Error('Amount must be positive');
  
  this.balance += amount;
  this.totalDeposits += amount;
  this.totalTransactions += 1;
  this.lastTransactionDate = new Date();
  
  await this.save();
  return this;
};

// Debit wallet (remove funds)
walletSchema.methods.debit = async function(amount, purpose = 'withdrawal') {
  if (amount <= 0) throw new Error('Amount must be positive');
  
  const canTransact = this.canTransact(amount);
  if (!canTransact.allowed) {
    throw new Error(canTransact.reason);
  }
  
  this.balance -= amount;
  this.todaySpent += amount;
  this.totalWithdrawals += amount;
  this.totalTransactions += 1;
  this.lastTransactionDate = new Date();
  
  await this.save();
  return this;
};

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ isActive: 1, isFrozen: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
