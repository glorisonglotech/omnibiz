const mongoose = require('mongoose');

const mpesaSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: { type: String },
  amount: { type: Number },
  accountReference: { type: String },
  transactionDesc: { type: String },
  merchantRequestID: { type: String, index: true },
  checkoutRequestID: { type: String, index: true },
  resultCode: { type: Number },
  resultDesc: { type: String },
  metadata: { type: Object },
  status: { type: String, default: 'Pending' },
  mpesaReceiptNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mpesa', mpesaSchema);
