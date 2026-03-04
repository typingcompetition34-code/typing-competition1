const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        
        // Ensure user owns notification
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
