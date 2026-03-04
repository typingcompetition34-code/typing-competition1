const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  roundNumber: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  netSpeed: { type: Number, default: 0 },
  grossSpeed: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  errors: { type: Number, default: 0 },
  charactersTyped: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false }
});

module.exports = mongoose.model('Performance', PerformanceSchema);
