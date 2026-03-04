const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  walletBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  uniqueKey: { type: String, unique: true }, // Added unique key
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
