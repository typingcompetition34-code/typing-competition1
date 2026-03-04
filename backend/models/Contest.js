const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  category: { type: String, enum: ['Full Keyboard', 'Basic Home Row', 'Numeric Keys'], required: true },
  entryFee: { type: Number, required: true },
  scheduledStartTime: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', ContestSchema);
