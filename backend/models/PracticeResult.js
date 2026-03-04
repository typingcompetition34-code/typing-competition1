const mongoose = require('mongoose');

const practiceResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['key', 'word', 'sentence', 'paragraph', 'typing-test'],
    required: true
  },
  level: {
    type: String,
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
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for fetching user results sorted by date
practiceResultSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('PracticeResult', practiceResultSchema);
