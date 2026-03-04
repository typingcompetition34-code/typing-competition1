const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Charity = require('../models/Charity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// POST /api/donations - Create a donation (Wallet Deduction)
router.post('/', auth, async (req, res) => {
  try {
    // Ensure req.body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Missing request body' });
    }

    const { amount, charityId } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Create Transaction Record (Validate first)
    const newTransaction = new Transaction({
      userId: req.user.id,
      type: 'Donation',
      amount: Number(amount),
      status: 'Completed', // Instant approval
      charityId: charityId,
      description: 'Charity Donation'
    });

    // Validate transaction to ensure schema is correct before deducting money
    const validationError = newTransaction.validateSync();
    if (validationError) {
        console.error('Transaction validation failed:', validationError);
        return res.status(500).json({ message: 'Transaction validation failed' });
    }

    let charity = null;
    if (charityId) {
        charity = await Charity.findById(charityId);
    }

    // Deduct from User Wallet
    user.walletBalance -= Number(amount);
    await user.save();

    try {
        await newTransaction.save();
    } catch (txErr) {
        console.error('Transaction save failed, refunding user:', txErr);
        // REFUND USER
        user.walletBalance += Number(amount);
        await user.save();
        return res.status(500).json({ message: 'Transaction failed, amount refunded. Please try again.' });
    }

    // Update Charity Raised Amount (Non-critical)
    if (charity) {
        try {
            charity.raisedAmount += Number(amount);
            await charity.save();
        } catch (charityErr) {
            console.error('Failed to update charity raised amount:', charityErr);
        }
    }

    // Notification (Non-critical)
    try {
        const notification = new Notification({
            user: req.user.id,
            message: `Your donation of ${amount} to ${charity ? charity.title : 'Charity'} was successful.`,
            type: 'success'
        });
        await notification.save();
    } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/donations/:id/status - Approve/Reject
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'Completed' (Approved) or 'Rejected'
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'Completed') {
            return res.status(400).json({ message: 'Transaction already completed' });
        }

        transaction.status = status;
        await transaction.save();

        if (status === 'Completed' && transaction.type === 'Donation' && transaction.charityId) {
            // Update Charity Raised Amount
            const charity = await Charity.findById(transaction.charityId);
            if (charity) {
                charity.raisedAmount += transaction.amount;
                await charity.save();
            }

            // Create Notification for User
            const notification = new Notification({
                userId: transaction.userId,
                message: `Your donation of ${transaction.amount} to ${charity ? charity.title : 'Charity'} has been approved!`,
                type: 'success'
            });
            await notification.save();
        } else if (status === 'Rejected') {
            // Create Notification for User
             const notification = new Notification({
                userId: transaction.userId,
                message: `Your donation of ${transaction.amount} has been rejected.`,
                type: 'error'
            });
            await notification.save();
        }

        res.json(transaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
