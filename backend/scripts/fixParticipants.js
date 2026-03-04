const mongoose = require('mongoose');
require('dotenv').config(); // Load .env from current directory

const Tournament = require('../models/Tournament');
const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/charity-typing';

const fixParticipants = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Find all approved tournament entry payments
    const payments = await PaymentRequest.find({
      type: 'tournament_entry',
      status: 'approved'
    });

    console.log(`Found ${payments.length} approved payments.`);

    let fixedCount = 0;

    for (const payment of payments) {
      if (!payment.tournament || !payment.user) continue;

      const tournament = await Tournament.findById(payment.tournament);
      if (!tournament) {
        console.log(`Tournament not found for payment ${payment._id}`);
        continue;
      }

      // Check if user is already in participants
      const isParticipant = tournament.participants.some(
        p => p.userId && p.userId.toString() === payment.user.toString()
      );

      if (!isParticipant) {
        console.log(`Adding user ${payment.user} to tournament ${tournament.title}`);
        tournament.participants.push({
          userId: payment.user,
          joinedAt: payment.createdAt || new Date()
        });
        await tournament.save();
        fixedCount++;
      }
    }

    console.log(`Fixed ${fixedCount} missing participants.`);
    
    // Optional: Fix Free tournaments if we can identify them? 
    // It's harder without transaction records for free joins (if they didn't exist).
    // But assuming the user is testing with paid tournaments as per the complaint.

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

fixParticipants();
