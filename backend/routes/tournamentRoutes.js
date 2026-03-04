const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Result = require('../models/Result');
const uuid = require('uuid');
const uuidv4 = uuid.v4;

// GET all tournaments (with optional status filtering)
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query; // 'type' could be 'admin' or 'user'
    
    let query = {};
    
    // User side: only show active/upcoming, exclude stopped
    if (type === 'user') {
      query.status = { $in: ['active', 'upcoming'] };
    } 
    // Admin side: show all, or filter if specific status requested
    else if (status) {
      query.status = status;
    }

    const tournaments = await Tournament.find(query).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new tournament
router.post('/', async (req, res) => {
  // Check if server capacity allows (Mock logic: limit to 5 active tournaments)
  const activeCount = await Tournament.countDocuments({ status: 'active' });
  if (activeCount >= 5) {
    // Note: We still allow creating "upcoming" tournaments
    if (req.body.status === 'active') {
      return res.status(400).json({ message: 'Server capacity reached. Cannot start new active tournament immediately.' });
    }
  }

  const { 
    title, description, startDate, endDate, 
    category, maxParticipants, entryFee, difficulty, customText 
  } = req.body;

  // Determine initial status based on start date
  const now = new Date();
  const start = new Date(startDate);
  let initialStatus = 'upcoming';
  if (start <= now && new Date(endDate) > now) {
    initialStatus = 'active';
  }

  const tournament = new Tournament({
    title,
    description,
    startDate,
    endDate,
    category,
    maxParticipants,
    entryFee,
    difficulty,
    customText,
    status: initialStatus,
    uniqueKey: uuidv4()
  });

  try {
    const newTournament = await tournament.save();
    res.status(201).json(newTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET Global Leaderboard (All time top scores)
router.get('/leaderboard/global', async (req, res) => {
  try {
    const results = await Result.find()
      .sort({ score: -1 })
      .limit(10)
      .populate('tournamentId', 'title');
      
    const populatedResults = await Promise.all(results.map(async (result) => {
        const user = await User.findById(result.userId);
        return {
            ...result.toObject(),
            username: user ? user.username : 'Unknown User'
        };
    }));
      
    res.json(populatedResults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mongoose = require('mongoose');

// GET single tournament
router.get('/:id', async (req, res) => {
  try {
    let id = req.params.id;
    
    // Trim whitespace
    id = id.trim();

    // Check validity
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid Tournament ID' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (err) {
    console.error('Error fetching tournament:', err);
    res.status(500).json({ message: err.message });
  }
});

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Charity = require('../models/Charity');

// POST Join Tournament (Pay Entry Fee)
router.post('/:id/join', async (req, res) => {
  const { userId, charityId } = req.body;
  
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Check if user already joined
    if (tournament.participants && tournament.participants.some(p => p.userId === userId)) {
      return res.status(400).json({ message: 'User already joined this tournament' });
    }

    // Check if full
    if (tournament.participants && tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    // Check if free
    if (tournament.entryFee === 0) {
      tournament.participants.push({ userId, joinedAt: new Date() });
      await tournament.save();
      return res.json({ message: 'Joined successfully (Free)' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check Balance
    if (user.walletBalance < tournament.entryFee) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct Balance
    user.walletBalance -= tournament.entryFee;
    await user.save();

    // Create Transaction
    const transaction = new Transaction({
      userId: user._id,
      type: 'Entry Fee',
      amount: tournament.entryFee,
      status: 'Completed',
      description: `Entry fee for ${tournament.title}`,
      referenceId: tournament._id,
      charityId: charityId || null // Link charity if selected
    });
    await transaction.save();

    // Update Charity Raised Amount (20% of fee)
    if (charityId) {
      const charity = await Charity.findById(charityId);
      if (charity) {
        const donationAmount = tournament.entryFee * 0.20;
        charity.raisedAmount += donationAmount;
        await charity.save();
      }
    }

    // Add participant
    tournament.participants.push({ userId, joinedAt: new Date() });
    await tournament.save();

    res.json({ message: 'Joined successfully', transactionId: transaction._id });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update tournament
router.put('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const fields = ['title', 'description', 'startDate', 'endDate', 'category', 'maxParticipants', 'entryFee', 'difficulty', 'customText', 'status'];
    
    fields.forEach(field => {
      if (req.body[field] != null) tournament[field] = req.body[field];
    });

    // Re-evaluate status if dates changed and status wasn't explicitly stopped
    if (tournament.status !== 'stopped') {
       const now = new Date();
       if (new Date(tournament.startDate) <= now && new Date(tournament.endDate) > now) {
         tournament.status = 'active';
       } else if (new Date(tournament.endDate) <= now) {
         tournament.status = 'completed';
       } else {
         tournament.status = 'upcoming';
       }
    }

    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT Stop Tournament
router.put('/:id/stop', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    tournament.status = 'stopped';
    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE tournament
router.delete('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    await tournament.deleteOne();
    // Also delete associated results?
    await Result.deleteMany({ tournamentId: req.params.id });
    
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LEADERBOARD & RESULTS ---

// GET Leaderboard for a tournament
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const results = await Result.find({ tournamentId: req.params.id })
      .sort({ score: -1 }) // Sort by highest score
      .limit(10); // Top 10

    // Populate user details (username) manually since userId in Result is a string (might be objectId string)
    // Or if we change Result schema to use ref: 'User' for userId, we can use .populate('userId', 'username')
    
    // Let's fetch user details for each result
    const populatedResults = await Promise.all(results.map(async (result) => {
        const user = await User.findById(result.userId);
        return {
            ...result.toObject(),
            username: user ? user.username : 'Unknown User'
        };
    }));

    res.json(populatedResults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Submit Result (Simulate user finishing)
router.post('/:id/results', async (req, res) => {
  try {
    const { userId, wpm, accuracy } = req.body;
    
    // Simple score calculation
    const score = Math.round(wpm * (accuracy / 100) * 10);

    const result = new Result({
      tournamentId: req.params.id,
      userId,
      wpm,
      accuracy,
      score
    });

    const savedResult = await result.save();
    res.status(201).json(savedResult);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
