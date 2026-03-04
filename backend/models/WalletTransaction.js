const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'CONTEST_ENTRY', 'CONTEST_PRIZE', 'CHAMPION_BONUS'], required: true },
  description: { type: String }, // For custom messages
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }, // Optional
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
