const mongoose = require('mongoose');

const practiceProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentLesson: { type: Number, default: 1 },
  currentSubLesson: { type: Number, default: 1 },
  completedLessons: [{ type: Number }], // Array of completed lesson IDs
  totalTimeSpent: { type: Number, default: 0 }, // In seconds
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PracticeProgress', practiceProgressSchema);
