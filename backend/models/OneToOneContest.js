const mongoose = require('mongoose');

const oneToOneResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    round: { type: Number, required: true }, // Added round number
    typedChars: { type: Number, required: true },
    correctChars: { type: Number, required: true },
    grossWpm: { type: Number, required: true },
    netWpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeUsedSec: { type: Number },
    timeUsed: { type: String },
    interrupted: { type: Boolean },
    difficultKeys: { type: [mongoose.Schema.Types.Mixed], default: undefined },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const oneToOneContestSchema = new mongoose.Schema({
  challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestType: { 
    type: String, 
    enum: ['Full Keyboard', 'Basic Home Row', 'Numeric Keys'], 
    required: true 
  },
  contestMode: { 
    type: String, 
    enum: ['Free Contest', 'Paid Contest'], 
    required: true 
  },
  entryFee: { type: Number, default: 0 },
  scheduledTime: { type: Date, required: true },
  durationSec: { type: Number, default: 300 },
  contestText: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  rejectionReason: { type: String },
  currentRound: { type: Number, default: 0 },
  isBreak: { type: Boolean, default: false },
  timeline: {
    round1Start: Date,
    round1End: Date,
    round2Start: Date,
    round2End: Date,
    round3Start: Date,
    round3End: Date,
    contestEnd: Date
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  results: { type: [oneToOneResultSchema], default: [] },
  prizeDetails: {
    totalPool: Number,
    winnerPrize: Number,
    championBonus: Number
  },
  seenByOpponent: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
oneToOneContestSchema.index({ challenger: 1, createdAt: -1 });
oneToOneContestSchema.index({ opponent: 1, createdAt: -1 });
oneToOneContestSchema.index({ status: 1 });
oneToOneContestSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('OneToOneContest', oneToOneContestSchema);
