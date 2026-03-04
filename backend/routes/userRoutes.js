const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RedeemRequest = require('../models/RedeemRequest');
const PracticeResult = require('../models/PracticeResult');
const PaymentRequest = require('../models/PaymentRequest');
const Result = require('../models/Result');
const Tournament = require('../models/Tournament');
const Notification = require('../models/Notification');
const OneToOneContest = require('../models/OneToOneContest');
const PaymentMethod = require('../models/PaymentMethod');

// @route   GET api/user/search
// @desc    Search users by username or uniqueKey
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        
        const query = {
            _id: { $ne: req.user.id }, // Exclude current user
            role: 'user'
        };

        if (q) {
            query.$or = [
                { username: { $regex: q, $options: 'i' } },
                { uniqueKey: { $regex: q, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('username uniqueKey _id').limit(50);

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/user/all
// @desc    Get all users (Admin)
// @access  Private (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/dashboard
// @desc    Get all user dashboard info
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Ensure we only fetch data for the logged-in user
    const userId = req.user.id;

    if (!userId) {
        console.error('Dashboard Error: User ID missing from token');
        return res.status(400).json({ message: 'User ID missing' });
    }

    // Convert to ObjectId to ensure strict matching
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log(`Fetching dashboard data for user: ${userId}`);

    // Parallel execution for faster response
    const [
      user,
      practiceResults,
      entryFeeStats,
      redeemStats,
      donationStats,
      totalRedeemRequestsCount,
      unreadNotificationsCount,
      unseenInvitationsCount,
      oneToOneContests
    ] = await Promise.all([
      User.findById(userId).select('-password'),
      PracticeResult.find({ userId: userObjectId }).sort({ date: -1 }).limit(50),
      // Aggregations for stats
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'Entry Fee' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RedeemRequest.aggregate([
        { $match: { userId: userObjectId, status: 'Accepted' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: { $regex: /^donation$/i }, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RedeemRequest.countDocuments({ userId: userObjectId }),
      Notification.countDocuments({ user: userId, read: false }),
      OneToOneContest.countDocuments({
          opponent: userId,
          status: 'Pending',
          $or: [{ seenByOpponent: false }, { seenByOpponent: { $exists: false } }]
      }),
      OneToOneContest.find({
          $or: [{ challenger: userId }, { opponent: userId }]
      })
          .select('challenger opponent contestType contestMode entryFee scheduledTime status rejectionReason winner createdAt')
          .populate('challenger', 'username uniqueKey')
          .populate('opponent', 'username uniqueKey')
          .sort({ createdAt: -1 })
          .limit(50)
    ]);

    if (!user) {
        console.error(`User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
    }

    console.log('Dashboard data fetched successfully');

    const totalFee = entryFeeStats[0]?.total || 0;
    const totalRedeemAmount = redeemStats[0]?.total || 0;
    const totalDonations = donationStats[0]?.total || 0;
    
    res.json({
      user,
      practiceResults,
      oneToOneContests,
      stats: {
          totalFee,
          totalRedeemAmount,
          totalDonations,
          totalRedeemRequests: totalRedeemRequestsCount
      },
      counts: {
          unreadNotifications: unreadNotificationsCount,
          unseenInvitations: unseenInvitationsCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/count
// @desc    Get total number of users
// @access  Private (Admin)
router.get('/count', auth, async (req, res) => {
    try {
        const count = await User.countDocuments({ role: 'user' });
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/user/wallet-total
// @desc    Get total wallet balance of all users and total spent
// @access  Private (Admin)
router.get('/wallet-total', auth, async (req, res) => {
  try {
    // 1. Total Wallet Balance (Current Holdings)
    const walletResult = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: "$walletBalance" } } }
    ]);
    const totalWallet = walletResult.length > 0 ? walletResult[0].total : 0;

    // 2. Total Revenue (Admin Income)
    // We only count actual revenue sources: Entry/Contest Fees, Donations, Tournament Fees
    // We EXCLUDE 'Deposit' as that is user funds, not admin revenue.
    const revenueResult = await Transaction.aggregate([
        { 
            $match: { 
                type: { $in: ['Entry Fee', 'Contest Fee', 'Donation', 'Tournament Fee'] },
                status: 'Completed'
            } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Total Payouts (Admin Expenses -> Prizes)
    // We deduct prizes paid out to winners.
    // Note: We do NOT deduct 'Redeem' (Withdrawals) here because that is returning user funds, not a P&L expense.
    // Admin Wallet = Revenue - Payouts
    const payoutResult = await Transaction.aggregate([
        { 
            $match: { 
                type: { $in: ['Prize', 'Champion Award'] },
                status: 'Completed'
            } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPayouts = payoutResult.length > 0 ? payoutResult[0].total : 0;

    // Admin Wallet Balance = Revenue - Payouts
    const adminBalance = totalRevenue - totalPayouts;

    res.json({ total: totalWallet, totalSpent: adminBalance });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/financials
// @desc    Get all financial data for user (transactions, deposits, redeems, payment methods)
// @access  Private
router.get('/financials', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Execute queries in parallel
        const [
            transactions,
            redeemRequests,
            depositHistory,
            paymentMethods
        ] = await Promise.all([
            Transaction.find({ userId: userId }).sort({ date: -1 }).limit(50),
            RedeemRequest.find({ userId: userId }).sort({ requestDate: -1 }).limit(50),
            PaymentRequest.find({ user: userId, type: 'wallet_deposit' }).sort({ createdAt: -1 }).limit(50),
            PaymentMethod.find()
        ]);

        res.json({
            transactions,
            redeemRequests,
            depositHistory,
            paymentMethods
        });
    } catch (err) {
        console.error('Error fetching financial data:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/admin/toggle-status/:id
// @desc    Toggle user active status
// @access  Admin
router.put('/admin/toggle-status/:id', auth, async (req, res) => {
    try {
        console.log(`Toggle status request for user ID: ${req.params.id} by admin: ${req.user.id}`);
        
        // Prevent self-deactivation
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot deactivate your own account.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            console.log(`User not found: ${req.params.id}`);
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Handle case where isActive might be undefined (legacy users)
        // Default to true if undefined
        const currentStatus = user.isActive === undefined ? true : user.isActive;
        user.isActive = !currentStatus;

        await user.save();
        
        const status = user.isActive ? 'activated' : 'deactivated';
        console.log(`User ${user.username} has been ${status}`);
        res.json({ message: `User ${user.username} has been ${status}.`, user });
    } catch (err) {
        console.error('Error in toggle-status:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// @route   PUT api/user/admin/reset-wallet/:id
// @desc    Reset user wallet to 0
// @access  Admin
router.put('/admin/reset-wallet/:id', auth, async (req, res) => {
    try {
        console.log(`Reset wallet request for ${req.params.id} by ${req.user.id}`);
        // Check if requester is admin
        const adminUser = await User.findById(req.user.id);
        
        if (!adminUser) {
             console.log(`Admin user not found: ${req.user.id}`);
             return res.status(403).json({ message: 'Access denied. User not found.' });
        }
        
        if (adminUser.role !== 'admin') {
             console.log(`Access denied for user ${adminUser.username} with role ${adminUser.role}`);
             return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.walletBalance = 0;
        await user.save();
        
        res.json({ message: `Wallet for ${user.username} has been reset to 0.`, user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/user/admin/reset-all-wallets
// @desc    Reset ALL user wallets to 0
// @access  Admin
router.put('/admin/reset-all-wallets', auth, async (req, res) => {
    try {
        console.log(`Reset ALL wallets request by ${req.user.id}`);
        // Check if requester is admin
        const adminUser = await User.findById(req.user.id);
        
        if (!adminUser || adminUser.role !== 'admin') {
             console.log(`Access denied for user ${req.user.id}`);
             return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Reset all users with role 'user'
        await User.updateMany({ role: 'user' }, { $set: { walletBalance: 0 } });
        
        res.json({ message: 'All user wallets have been reset to 0.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
