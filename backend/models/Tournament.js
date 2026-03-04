const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['1v1', 'Group'],
    default: 'Group'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  entryFee: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  customText: {
    type: String,
    required: true, // Admin must upload custom text
    default: 'The quick brown fox jumps over the lazy dog.'
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'stopped', 'completed'],
    default: 'upcoming'
  },
  uniqueKey: { type: String, unique: true }, // Added unique key
  createdAt: {
    type: Date,
    default: Date.now
  },
  participants: [{
    userId: String, // Placeholder for user ID or Name
    joinedAt: { type: Date, default: Date.now }
  }]
});

// Auto-update status based on dates (middleware could be used, or check on fetch)
// For simplicity, we'll handle status updates in the controller or rely on date comparisons

module.exports = mongoose.model('Tournament', tournamentSchema);
