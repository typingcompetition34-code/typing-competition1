const mongoose = require('mongoose');

const redeemRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  processedDate: { type: Date },
  adminNote: { type: String }
});

module.exports = mongoose.model('RedeemRequest', redeemRequestSchema);
