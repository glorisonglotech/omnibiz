const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  amount: { type: Number, required: true },
  category: String,
  date: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
