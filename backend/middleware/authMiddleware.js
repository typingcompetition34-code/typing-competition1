const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const secret = process.env.JWT_SECRET || 'secret_key_123';
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;

    // Check if user is active
    const user = await User.findById(req.user.id).select('isActive');
    if (!user) {
        console.log(`Auth Middleware: User not found ${req.user.id}`);
        return res.status(401).json({ message: 'User not found' });
    }
    if (user.isActive === false) {
        console.log(`Auth Middleware: User deactivated ${req.user.id}`);
        return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
