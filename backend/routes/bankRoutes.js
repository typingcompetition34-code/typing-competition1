const express = require('express');
const router = express.Router();

// Get bank accounts
router.get('/', (req, res) => {
  // Return mock data or empty array for now
  res.json([
    { id: 1, bankName: 'Mock Bank', accountNumber: '1234567890', accountName: 'Charity Typing' }
  ]);
});

module.exports = router;
