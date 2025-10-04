const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  amount: Number,
  type: { type: String, enum: ["income", "expense"], required: true },
  category: String,
  status: { type: String, default: "completed" },
  reference: String,
  notes: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
