const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  userId: {
    type: String, // Using string for now (simulating user name/ID)
    required: true
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
