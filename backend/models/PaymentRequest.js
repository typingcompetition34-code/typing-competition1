const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['tournament_entry', 'wallet_deposit'],
    default: 'tournament_entry'
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  amount: {
    type: Number,
    required: true
  },
  receiptUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
