const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  roundNumber: { type: Number, required: true }, // 1, 2, 3
  text: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

module.exports = mongoose.model('Round', RoundSchema);
