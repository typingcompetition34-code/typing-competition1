const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 8-digit unique ID
    let uniqueKey;
    let isUnique = false;
    while (!isUnique) {
      uniqueKey = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingUser = await User.findOne({ uniqueKey });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user = new User({
      username,
      email,
      password,
      uniqueKey: uniqueKey
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check for user by username OR email (to support legacy email logins if needed, or strictly username)
    // The request is to login by username. I will support username primarily.
    // If the frontend sends 'username', we use that. If it sends 'email', we use that.
    
    let user;
    if (username) {
      user = await User.findOne({ username });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (user.isActive === false) {
        return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, walletBalance: user.walletBalance } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const auth = require('../middleware/authMiddleware');

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
