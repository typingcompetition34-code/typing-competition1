const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Entry Fee', 'Prize', 'Deposit', 'Withdrawal', 'Donation', 'Contest Fee', 'Tournament Fee', 'Redeem'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Accepted', 'Rejected', 'Completed', 'Pending'], default: 'Completed' }, // 'Accepted/Rejected' for Entry Fee as per user request
  description: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Tournament ID
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' }, // Linked Charity Campaign
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
