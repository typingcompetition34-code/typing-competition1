const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const tournamentRoutes = require('./routes/tournamentRoutes');
const authRoutes = require('./routes/authRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const userRoutes = require('./routes/userRoutes');
const charityRoutes = require('./routes/charityRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const donationRoutes = require('./routes/donationRoutes');
const oneToOneRoutes = require('./routes/oneToOneRoutes');
const redeemRoutes = require('./routes/redeemRoutes');
const bankRoutes = require('./routes/bankRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const contestRoutes = require('./routes/contestRoutes');

const schedulerService = require('./services/schedulerService');
const contestScheduler = require('./services/contestScheduler');
const Performance = require('./models/Performance');
const { updateParticipantState } = require('./services/liveContestState');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory statically with caching headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  immutable: true
}));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/user', userRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/one-to-one', oneToOneRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/accounts', bankRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/contests', contestRoutes);

// Socket Logic
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
      socket.user = decoded.user;
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
    }
  }
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  if (socket.user) {
    socket.join(socket.user.id);
    console.log(`User ${socket.user.id} joined room ${socket.user.id}`);
  }

  socket.on('arena:join', (contestId) => {
    // Delegate join logic to contestScheduler
    contestScheduler.handleJoin(socket, contestId);
    console.log(`User ${socket.id} joined contest ${contestId}`);
  });

  socket.on('typing:update', async (data) => {
    const contestId = String(data?.contestId || '').trim();
    const userId = String(data?.userId || data?.snapshot?.userId || socket.user?.id || '').trim();
    if (!contestId || !userId) return;

    const snapshot = data?.snapshot ? { ...data.snapshot } : null;
    if (snapshot) {
      if (!snapshot.userId) snapshot.userId = userId;
      if (!snapshot.lastTypedAtMs) snapshot.lastTypedAtMs = Date.now();
    }

    socket.to(contestId).emit('opponent:update', {
      contestId,
      roundNumber: data?.roundNumber,
      userId,
      snapshot,
      errors: data?.errors,
      charactersTyped: data?.charactersTyped
    });
    
    // Update live state
    if (snapshot) {
        updateParticipantState(contestId, userId, snapshot);
    }
    
    try {
        await Performance.findOneAndUpdate(
            { contestId, roundNumber: data.roundNumber, userId },
            { 
                $set: {
                    netSpeed: data.netSpeed,
                    grossSpeed: data.grossSpeed,
                    accuracy: data.accuracy,
                    errors: data.errors,
                    charactersTyped: data.charactersTyped
                }
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error('Error updating performance:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize Scheduler
schedulerService.init(io);
contestScheduler.init(io);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/charity-typing';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
