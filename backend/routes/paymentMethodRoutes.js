const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const PaymentMethod = require('../models/PaymentMethod');

// @route   GET /api/payment-methods
// @desc    Get all payment methods
// @access  Private (Both User and Admin need to see this)
router.get('/', auth, async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/payment-methods
// @desc    Add a payment method
// @access  Private (Admin only - assuming checking role or just basic auth for now as per previous patterns)
// Note: In a real app, check for req.user.isAdmin
router.post('/', auth, async (req, res) => {
  const { title, details } = req.body;
  console.log('Adding payment method:', { title, details }); // Debug log

  try {
    // Basic validation
    if (!title || !details) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const newMethod = new PaymentMethod({
      title,
      details
    });

    const savedMethod = await newMethod.save();
    console.log('Payment method saved:', savedMethod); // Debug log
    res.json(savedMethod);
  } catch (err) {
    console.error('Error saving payment method:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   DELETE /api/payment-methods/:id
// @desc    Delete a payment method
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await method.deleteOne();
    res.json({ message: 'Payment method removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
