const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const PaymentRequest = require('../models/PaymentRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Tournament = require('../models/Tournament');
const auth = require('../middleware/authMiddleware');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// @route   POST api/payments/submit
// @desc    Submit entry fee payment (Tournament) - Wallet Deduction
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    console.log('Payment submission received:', req.body);

    const { tournamentId, charityId, amount } = req.body;
    
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Check if full
    if (tournament.participants && tournament.participants.length >= tournament.maxParticipants) {
         return res.status(400).json({ message: 'Tournament is full' });
    }
    
    // Check if user has already paid for this tournament
    const existingPayment = await PaymentRequest.findOne({
        user: req.user.id,
        tournament: tournamentId,
        status: { $in: ['pending', 'approved'] }
    });

    if (existingPayment) {
        return res.status(400).json({ message: 'Payment already exists or approved.' });
    }
    
    // Check if user already joined directly (redundancy check)
    if (tournament.participants && tournament.participants.some(p => p.userId === req.user.id)) {
        return res.status(400).json({ message: 'User already joined this tournament' });
    }

    const user = await User.findById(req.user.id);
    if (user.walletBalance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Prepare records
    const paymentRequest = new PaymentRequest({
        user: req.user.id,
        amount: Number(amount),
        type: 'tournament_entry',
        tournament: tournamentId,
        status: 'approved',
        receiptUrl: '' // Not needed
    });

    const transaction = new Transaction({
        userId: req.user.id,
        type: 'Tournament Fee',
        amount: Number(amount),
        description: 'Tournament Entry Fee',
        status: 'Completed',
        referenceId: paymentRequest._id
    });

    // Deduct from User
    user.walletBalance -= Number(amount);
    await user.save();

    try {
        await paymentRequest.save();
        await transaction.save();

        // Add participant to tournament
        tournament.participants.push({ userId: req.user.id, joinedAt: new Date() });
        await tournament.save();
    } catch (saveErr) {
        console.error('Payment/Transaction save failed, refunding user:', saveErr);
        // REFUND USER
        user.walletBalance += Number(amount);
        await user.save();
        // Try to clean up if one succeeded (optional, but good practice)
        // For now, just return error. The orphaned record (if any) is less critical than money loss.
        return res.status(500).json({ message: 'Payment processing failed, amount refunded. Please try again.' });
    }

    // Notification (Non-critical)
    try {
        const notification = new Notification({
            user: req.user.id,
            message: `Payment of ${amount} for tournament successful.`,
            type: 'success'
        });
        await notification.save();
    } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
    }

    res.status(201).json(paymentRequest);
  } catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST api/payments/deposit
// @desc    Submit wallet deposit request
// @access  Private
router.post('/deposit', auth, upload.single('receipt'), async (req, res) => {
    try {
        console.log('Deposit submission received:', req.body);
        console.log('File:', req.file);
  
        const { amount, paymentMethodId } = req.body;
  
        const receiptPath = req.file ? req.file.path.replace(/\\/g, "/") : '';
  
        const paymentRequest = new PaymentRequest({
          user: req.user.id,
          amount,
          paymentMethod: paymentMethodId,
          receiptUrl: receiptPath,
          type: 'wallet_deposit'
        });
  
        await paymentRequest.save();
        console.log('Deposit request saved:', paymentRequest);
        res.status(201).json(paymentRequest);
    } catch (err) {
      console.error('Deposit Error:', err);
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });

// @route   GET api/payments/admin
// @desc    Get all payment requests (Tournament & Deposits)
// @access  Admin (Protected)
router.get('/admin', auth, async (req, res) => {
    try {
        const requests = await PaymentRequest.find()
            .populate('user', 'username email uniqueKey')
            .populate('tournament', 'title entryFee')
            .populate('charity', 'title')
            .populate('paymentMethod', 'title details')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/payments/my-history
// @desc    Get current user's payment history
// @access  Private
router.get('/my-history', auth, async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ user: req.user.id })
            .populate('tournament', 'title')
            .populate('paymentMethod', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/payments/:id/action
// @desc    Accept or Reject payment
// @access  Admin
router.put('/:id/action', auth, async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'
    
    try {
        const paymentRequest = await PaymentRequest.findById(req.params.id);
        if (!paymentRequest) return res.status(404).json({ message: 'Request not found' });

        if (paymentRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        if (action === 'approve') {
            paymentRequest.status = 'approved';
            
            // If it's a wallet deposit, add funds to user wallet
            if (paymentRequest.type === 'wallet_deposit') {
                const user = await User.findById(paymentRequest.user);
                if (user) {
                    user.walletBalance = (user.walletBalance || 0) + paymentRequest.amount;
                    await user.save();

                    // Create Transaction Record
                    const transaction = new Transaction({
                        userId: user._id,
                        type: 'Deposit',
                        amount: paymentRequest.amount,
                        status: 'Completed',
                        description: 'Wallet Deposit Approved',
                        referenceId: paymentRequest._id
                    });
                    await transaction.save();
                }
            }

            // Send Notification
            const message = paymentRequest.type === 'wallet_deposit' 
                ? `Your deposit of ${paymentRequest.amount} has been approved.`
                : `Your payment for tournament has been approved.`;

            const notification = new Notification({
                user: paymentRequest.user,
                message: message,
                type: 'success'
            });
            await notification.save();

        } else if (action === 'reject') {
            paymentRequest.status = 'rejected';
             // Send Notification
             const message = paymentRequest.type === 'wallet_deposit' 
                ? `Your deposit of ${paymentRequest.amount} has been rejected.`
                : `Your payment for tournament has been rejected.`;

             const notification = new Notification({
                user: paymentRequest.user,
                message: message,
                type: 'error'
            });
            await notification.save();
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await paymentRequest.save();
        res.json(paymentRequest);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/payments/check/:tournamentId
// @desc    Check payment status for a specific tournament
// @access  Private
router.get('/check/:tournamentId', auth, async (req, res) => {
    try {
        const paymentRequest = await PaymentRequest.findOne({
            user: req.user.id,
            tournament: req.params.tournamentId
        }).sort({ createdAt: -1 }); // Get latest

        if (!paymentRequest) {
            return res.json({ status: 'none' });
        }
        res.json({ status: paymentRequest.status });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;