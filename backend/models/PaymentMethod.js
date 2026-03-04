const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: true }, // Bank Account Number, Wallet Address, etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
