const express = require('express');
const router = express.Router();
const RedeemRequest = require('../models/RedeemRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

const Transaction = require('../models/Transaction'); // Import Transaction model

// @route   POST api/redeem
// @desc    Create redeem request
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Note: User wallet check removed as per requirement (Redeem adds to wallet)

    const newRequest = new RedeemRequest({
      userId: req.user.id,
      amount,
      reason,
      status: 'Pending'
    });
    
    const savedRequest = await newRequest.save();

    try {
      // Create Transaction Record (Pending)
      const newTransaction = new Transaction({
          userId: req.user.id,
          type: 'Redeem', // Changed from Withdrawal to generic Redeem
          amount: amount,
          status: 'Pending',
          description: `Redeem Request: ${reason}`,
          referenceId: savedRequest._id
      });
      await newTransaction.save();
    } catch (txErr) {
      // Rollback: Delete the request if transaction creation fails
      await RedeemRequest.findByIdAndDelete(savedRequest._id);
      throw txErr;
    }

    res.json(savedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/redeem
// @desc    Get current user's redeem requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const requests = await RedeemRequest.find({ userId: req.user.id }).sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/redeem/admin
// @desc    Get all redeem requests (Admin)
// @access  Admin
router.get('/admin', auth, async (req, res) => {
    try {
        const requests = await RedeemRequest.find()
            .populate('userId', 'username email uniqueKey')
            .sort({ requestDate: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/redeem/:id/action
// @desc    Approve or Reject redeem request
// @access  Admin
router.put('/:id/action', auth, async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'

    try {
        const request = await RedeemRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        const user = await User.findById(request.userId);

        if (action === 'approve') {
            // 1. Calculate Admin Wallet Balance
            const incomeResult = await Transaction.aggregate([
                { 
                    $match: { 
                        type: { $in: ['Entry Fee', 'Contest Fee', 'Donation', 'Tournament Fee', 'Deposit'] },
                        status: 'Completed'
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalIncome = incomeResult[0]?.total || 0;

            const expenseResult = await RedeemRequest.aggregate([
                { $match: { status: 'Accepted' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalExpenses = expenseResult[0]?.total || 0;

            const adminBalance = totalIncome - totalExpenses;

            // 2. Check if Admin has enough funds
            if (adminBalance < request.amount) {
                return res.status(400).json({ message: 'Admin wallet balance is low. Cannot approve.' });
            }

            // 3. ADD to User Wallet (as per requirement)
            user.walletBalance += request.amount;
            await user.save();

            request.status = 'Accepted';
            request.processedDate = Date.now();
            
            // Update Transaction Status
            await Transaction.findOneAndUpdate(
                { referenceId: request._id },
                { status: 'Completed' } // Mark as Completed
            );

            // Send Notification (Disabled as per request)
            /*
            const notification = new Notification({
                user: request.userId,
                message: `Your redeem request for ${request.amount} has been approved and added to your wallet.`,
                type: 'success'
            });
            await notification.save();
            */

        } else if (action === 'reject') {
            request.status = 'Rejected';
            request.processedDate = Date.now();

            // No refund needed as we didn't deduct yet.
            // Just update Transaction Status
            await Transaction.findOneAndUpdate(
                { referenceId: request._id },
                { status: 'Rejected' }
            );

            // Send Notification
            const notification = new Notification({
                user: request.userId,
                message: `Your redeem request for ${request.amount} has been rejected.`,
                type: 'error'
            });
            await notification.save();
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await request.save();
        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/redeem/stats
// @desc    Get total approved redeem amount
// @access  Admin
router.get('/stats', auth, async (req, res) => {
    try {
        const approvedRequests = await RedeemRequest.find({ status: 'Accepted' });
        const totalRedeemed = approvedRequests.reduce((acc, curr) => acc + curr.amount, 0);
        res.json({ totalRedeemed });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
