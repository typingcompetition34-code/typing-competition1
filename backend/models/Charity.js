const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  description: { type: String, required: true }, // Story
  videoUrl: { type: String }, // Optional video URL
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Charity', charitySchema);
