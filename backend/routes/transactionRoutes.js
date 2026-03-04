const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/authMiddleware');

// @route   GET api/transactions/my
// @desc    Get current user's transactions
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 }).limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all transactions (Admin)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'username')
      .populate('charityId', 'title')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
