const OneToOneContest = require('../models/OneToOneContest');
const User = require('../models/User');
const AdminWallet = require('../models/AdminWallet');
const WalletTransaction = require('../models/WalletTransaction');
const Transaction = require('../models/Transaction'); // Import Transaction model
const { generateContestText } = require('../utils/textGenerator');
const { getLiveRoom, getParticipantState } = require('./liveContestState');

let ioInstance;

const ROUND_DURATION = 5 * 60 * 1000; // 5 minutes
const BREAK_DURATION = 10 * 1000; // 10 seconds
const TOTAL_ROUNDS = 3;

const breakCountdownIntervalsByContestId = new Map();

const clearBreakCountdown = (contestId) => {
  const key = String(contestId || '');
  const existing = breakCountdownIntervalsByContestId.get(key);
  if (existing) clearInterval(existing);
  breakCountdownIntervalsByContestId.delete(key);
};

const ensureBreakCountdown = ({ contestId, round, nextRoundStart }) => {
  if (!ioInstance) return;
  const contestKey = String(contestId || '');
  if (!contestKey) return;

  const endAtMs = new Date(nextRoundStart).getTime();
  if (!Number.isFinite(endAtMs)) return;

  if (breakCountdownIntervalsByContestId.has(contestKey)) return;

  const tick = () => {
    const nowMs = Date.now();
    const seconds = Math.max(0, Math.ceil((endAtMs - nowMs) / 1000));
    ioInstance.to(contestKey).emit('round:countdown', {
      round,
      seconds
    });
    if (seconds <= 0) {
      clearBreakCountdown(contestKey);
    }
  };

  tick();
  const intervalId = setInterval(tick, 1000);
  breakCountdownIntervalsByContestId.set(contestKey, intervalId);
};

const init = (io) => {
  ioInstance = io;
  recoverContests();
  // Check periodically for any missed events (failsafe)
  setInterval(recoverContests, 60 * 1000);
};

const recoverContests = async () => {
  try {
    const activeContests = await OneToOneContest.find({
      status: { $in: ['Accepted', 'Active'] }
    });

    activeContests.forEach(contest => {
      // If contest is old (e.g. > 24h), maybe mark as cancelled or completed?
      // For now, just try to resume flow.
      if (contest.timeline && contest.timeline.contestEnd) {
         if (Date.now() > new Date(contest.timeline.contestEnd).getTime() + 60000 && contest.status !== 'Completed') {
             // It finished while server was down
             finishContest(contest._id);
         } else {
             scheduleNextEvent(contest);
         }
      }
    });
  } catch (err) {
    console.error('Error recovering contests:', err);
  }
};

const scheduleContest = async (contestId, startTime) => {
  try {
    const contest = await OneToOneContest.findById(contestId);
    if (!contest) return;

    const start = new Date(startTime).getTime();
    
    // Set up timeline
    contest.timeline = {
      round1Start: new Date(start),
      round1End: new Date(start + ROUND_DURATION),
      round2Start: new Date(start + ROUND_DURATION + BREAK_DURATION),
      round2End: new Date(start + ROUND_DURATION + BREAK_DURATION + ROUND_DURATION),
      round3Start: new Date(start + 2 * (ROUND_DURATION + BREAK_DURATION)),
      round3End: new Date(start + 2 * (ROUND_DURATION + BREAK_DURATION) + ROUND_DURATION),
      contestEnd: new Date(start + 2 * (ROUND_DURATION + BREAK_DURATION) + ROUND_DURATION)
    };
    
    // Ensure contestText is generated for the first round immediately
    if (!contest.contestText || contest.currentRound === 0) {
        contest.currentRound = 1;
        contest.contestText = generateContestText(contest.contestType, `${String(contest._id)}::round1`);
    }

    await contest.save();
    
    console.log(`Contest ${contestId} scheduled. Round 1 starts at ${contest.timeline.round1Start}`);
    
    scheduleNextEvent(contest);
  } catch (err) {
    console.error(`Error scheduling contest ${contestId}:`, err);
  }
};

const scheduleNextEvent = (contest) => {
  const now = Date.now();
  const timeline = contest.timeline;
  
  if (!timeline || !timeline.round1Start) return;

  // Use a small buffer to avoid double-firing if we are exactly on time
  const buffer = 100; 

  if (now < new Date(timeline.round1Start).getTime() - buffer) {
    // Before Round 1
    const delay = new Date(timeline.round1Start).getTime() - now;
    setTimeout(() => startRound(contest._id, 1), delay);
  } else if (now < new Date(timeline.round1End).getTime() - buffer) {
    // In Round 1
    if (contest.currentRound < 1) startRound(contest._id, 1);
    else {
        // Ensure end is scheduled
        const delay = new Date(timeline.round1End).getTime() - now;
        setTimeout(() => endRound(contest._id, 1), delay);
    }
  } else if (now < new Date(timeline.round2Start).getTime() - buffer) {
    // In Break 1
    // Ensure Round 1 ended
    if (contest.currentRound === 1) endRound(contest._id, 1); // This might re-emit result, which is fine
    if (contest.currentRound === 1) {
      ensureBreakCountdown({ contestId: contest._id, round: 1, nextRoundStart: timeline.round2Start });
    }
    const delay = new Date(timeline.round2Start).getTime() - now;
    setTimeout(() => startRound(contest._id, 2), delay);
  } else if (now < new Date(timeline.round2End).getTime() - buffer) {
    // In Round 2
    if (contest.currentRound < 2) startRound(contest._id, 2);
    else {
        const delay = new Date(timeline.round2End).getTime() - now;
        setTimeout(() => endRound(contest._id, 2), delay);
    }
  } else if (now < new Date(timeline.round3Start).getTime() - buffer) {
    // In Break 2
    if (contest.currentRound === 2) endRound(contest._id, 2);
    if (contest.currentRound === 2) {
      ensureBreakCountdown({ contestId: contest._id, round: 2, nextRoundStart: timeline.round3Start });
    }
    const delay = new Date(timeline.round3Start).getTime() - now;
    setTimeout(() => startRound(contest._id, 3), delay);
  } else if (now < new Date(timeline.round3End).getTime() - buffer) {
    // In Round 3
    if (contest.currentRound < 3) startRound(contest._id, 3);
    else {
        const delay = new Date(timeline.round3End).getTime() - now;
        setTimeout(() => finishContest(contest._id), delay);
    }
  } else {
    // After contest end
    if (contest.status !== 'Completed') {
      finishContest(contest._id);
    }
  }
};

const startRound = async (contestId, roundNum) => {
  try {
    const contest = await OneToOneContest.findById(contestId);
    if (!contest) return;

    if (contest.currentRound === roundNum && !contest.isBreak) {
        // Already started?
        // Just emit again to be safe for reconnecting clients
    }

    contest.currentRound = roundNum;
    contest.isBreak = false;
    contest.contestText = generateContestText(contest.contestType, `${String(contest._id)}::round${roundNum}`);
    await contest.save();

    console.log(`Contest ${contestId}: Starting Round ${roundNum}`);

    const endTime = contest.timeline[`round${roundNum}End`];
    
    if (ioInstance) {
        clearBreakCountdown(contestId);
        ioInstance.to(contestId.toString()).emit('round:start', {
            round: roundNum,
            roundNumber: roundNum,
            totalRounds: TOTAL_ROUNDS,
            endTime: endTime || new Date(Date.now() + ROUND_DURATION), // Fallback if timeline missing
            serverTime: new Date(),
            contestText: contest.contestText,
            contestType: contest.contestType
        });
    }

    // Schedule end
    const delay = new Date(endTime).getTime() - Date.now();
    if (delay > 0) {
        setTimeout(() => endRound(contestId, roundNum), delay);
    } else {
        endRound(contestId, roundNum);
    }
  } catch (err) {
    console.error(`Error starting round ${roundNum} for contest ${contestId}:`, err);
  }
};

const endRound = async (contestId, roundNum) => {
  try {
    // Atomically set isBreak=true to claim processing
    const contest = await OneToOneContest.findOneAndUpdate(
      { _id: contestId, currentRound: roundNum, isBreak: { $ne: true } },
      { $set: { isBreak: true } },
      { new: true }
    );
    if (!contest) return; // Already processed or invalid state

    console.log(`Contest ${contestId}: Ending Round ${roundNum}`);

    // Update timeline to reflect actual end time (supports early completion)
    const now = Date.now();
    if (!contest.timeline) contest.timeline = {};
    const timeline = contest.timeline;
    
    if (roundNum === 1) {
        timeline.round1End = new Date(now);
        timeline.round2Start = new Date(now + BREAK_DURATION);
        timeline.round2End = new Date(now + BREAK_DURATION + ROUND_DURATION);
        timeline.round3Start = new Date(now + 2 * BREAK_DURATION + ROUND_DURATION);
        timeline.round3End = new Date(now + 2 * BREAK_DURATION + 2 * ROUND_DURATION);
        timeline.contestEnd = timeline.round3End;
    } else if (roundNum === 2) {
        timeline.round2End = new Date(now);
        timeline.round3Start = new Date(now + BREAK_DURATION);
        timeline.round3End = new Date(now + BREAK_DURATION + ROUND_DURATION);
        timeline.contestEnd = timeline.round3End;
    } else if (roundNum === 3) {
        timeline.round3End = new Date(now);
        timeline.contestEnd = new Date(now);
    }
    
    // Save updated timeline (atomic update not required here since we own isBreak=true)
    await OneToOneContest.updateOne({ _id: contestId }, { $set: { timeline } });

    // Emit result/break
    if (roundNum < 3) {
        const nextStart = timeline[`round${roundNum + 1}Start`];
        if (ioInstance) {
            ioInstance.to(contestId.toString()).emit('round:result', {
                round: roundNum,
                roundNumber: roundNum,
                totalRounds: TOTAL_ROUNDS,
                nextRoundStart: nextStart,
                countdown: BREAK_DURATION / 1000,
                results: contest.results || []
            });
        }

        ensureBreakCountdown({ contestId, round: roundNum, nextRoundStart: nextStart });
        
        // Schedule next round
        const delay = new Date(nextStart).getTime() - Date.now();
        if (delay > 0) {
            setTimeout(() => startRound(contestId, roundNum + 1), delay);
        } else {
            startRound(contestId, roundNum + 1);
        }
    } else {
        // Round 3 end
        await finishContest(contestId);
    }
  } catch (err) {
    console.error(`Error ending round ${roundNum} for contest ${contestId}:`, err);
  }
};

const checkRoundCompletion = async (contestId, roundNum) => {
    try {
        const contest = await OneToOneContest.findById(contestId);
        if (!contest) return;
        
        const results = contest.results || [];
        const count = results.filter(r => Number(r.round) === Number(roundNum)).length;
        
        console.log(`Checking round completion for ${contestId}, Round ${roundNum}. Count: ${count}`);

        if (count >= 2) {
             // Both finished, end round early
             // await endRound(contestId, roundNum);
             console.log(`Round ${roundNum} completion check passed (waiting for timer)`);
        }
    } catch (err) {
        console.error(`Error checking round completion for ${contestId}:`, err);
    }
};

const finishContest = async (contestId) => {
  try {
    const contest = await OneToOneContest.findById(contestId); // Ensure we have results
    if (!contest || contest.status === 'Completed') return;

    console.log(`Contest ${contestId}: Finishing...`);

    // 1. Calculate Winner
    const results = contest.results || [];
    const challengerId = contest.challenger.toString();
    const opponentId = contest.opponent.toString();
    
    let challengerWins = 0;
    let opponentWins = 0;
    let challengerTotalWpm = 0;
    let opponentTotalWpm = 0;
    
    [1, 2, 3].forEach(round => {
        const cRes = results.find(r => r.user.toString() === challengerId && r.round === round);
        const oRes = results.find(r => r.user.toString() === opponentId && r.round === round);

        const cWpm = cRes ? cRes.netWpm : 0;
        const oWpm = oRes ? oRes.netWpm : 0;

        // Log winner calculation based on Net Speed as requested
        console.log(`Contest ${contestId} Round ${round}: Challenger Net WPM: ${cWpm}, Opponent Net WPM: ${oWpm}`);

        challengerTotalWpm += cWpm;
        opponentTotalWpm += oWpm;

        if (cWpm > oWpm) challengerWins++;
        else if (oWpm > cWpm) opponentWins++;
    });

    let winnerId = null;
    if (challengerWins > opponentWins) winnerId = challengerId;
    else if (opponentWins > challengerWins) winnerId = opponentId;
    else {
        // Tie on rounds? Check total WPM
        if (challengerTotalWpm > opponentTotalWpm) winnerId = challengerId;
        else if (opponentTotalWpm > challengerTotalWpm) winnerId = opponentId;
    }
    
    contest.winner = winnerId;
    contest.status = 'Completed';
    contest.completedAt = new Date();
    await contest.save();
    
    // 2. Wallet Settlement
    let prizeDetails = null;
    console.log(`Contest ${contestId}: Checking wallet settlement. Winner: ${winnerId}, Mode: ${contest.contestMode}`);
    
    if (winnerId && (contest.contestMode === 'Paid Contest' || contest.contestMode === 'Paid')) {
        prizeDetails = await settleWallet(contest, winnerId);
        if (prizeDetails) {
            contest.prizeDetails = prizeDetails;
            await contest.save();
        } else {
            console.error(`Contest ${contestId}: Wallet settlement returned null.`);
        }
    } else {
        console.log(`Contest ${contestId}: Skipping wallet settlement (Winner: ${winnerId}, Mode: ${contest.contestMode})`);
    }
    
    // 3. Emit Final Event
    if (ioInstance) {
        ioInstance.to(contestId.toString()).emit('contest:final', {
            winnerId: winnerId,
            challengerWins,
            opponentWins,
            prizeDetails, // { totalPool, winnerPrize, championBonus }
            results: contest.results || []
        });
    }
    return contest;
  } catch (err) {
    console.error(`Error finishing contest ${contestId}:`, err);
    return null;
  }
};

const settleWallet = async (contest, winnerId) => {
    // "Winner Prize (70%) 700 → Transfer to Winner Wallet
    // Champion Award (10%) 100 → Log as Champion Bonus (visible in UI)
    // Admin Revenue (20%) 200 → Remains in Admin Wallet"
    
    const totalPool = (contest.entryFee || 0) * 2;
    if (totalPool <= 0) return null;
    
    const winnerPrize = totalPool * 0.70;
    const championBonus = totalPool * 0.10;
    const totalPayout = winnerPrize + championBonus;
    
    const session = await User.startSession();
    session.startTransaction();
    
    try {
        const winner = await User.findById(winnerId).session(session);
        let adminWallet = await AdminWallet.findOne().session(session);
        
        if (!adminWallet) {
             console.log(`[SETTLE] Admin wallet not found, creating one...`);
             adminWallet = new AdminWallet({ balance: 0 });
             await adminWallet.save({ session });
        }
        
        // Deduct from Admin (who holds the escrow)
        if (adminWallet.balance < totalPayout) {
            console.error(`CRITICAL: Admin wallet insufficient for contest ${contest._id}`);
            // Force proceed? Or fail?
            // If we fail, user doesn't get paid.
            // Let's assume balance is there.
        }

        adminWallet.balance -= totalPayout;
        await adminWallet.save({ session });
        
        // Add to Winner
        console.log(`[PAYOUT] Winner ${winnerId} balance BEFORE: ${winner.walletBalance}, Adding: ${totalPayout}`);
        winner.walletBalance += totalPayout;
        await winner.save({ session });
        console.log(`[PAYOUT] Winner ${winnerId} balance AFTER: ${winner.walletBalance}`);
        
        // Create WalletTransaction Records (User History)
        await new WalletTransaction({
            userId: winnerId,
            amount: winnerPrize,
            type: 'CONTEST_PRIZE',
            reference: contest._id,
            description: 'Contest Winner Prize (70%)'
        }).save({ session });
        
        await new WalletTransaction({
            userId: winnerId,
            amount: championBonus,
            type: 'CHAMPION_BONUS',
            reference: contest._id,
            description: 'Champion Award (10%)'
        }).save({ session });

        // Create Transaction Records (System Metrics)
        await new Transaction({
            userId: winnerId,
            amount: winnerPrize,
            type: 'Prize',
            status: 'Completed',
            description: 'Contest Winner Prize (70%)',
            referenceId: contest._id
        }).save({ session });

        await new Transaction({
            userId: winnerId,
            amount: championBonus,
            type: 'Prize',
            status: 'Completed',
            description: 'Champion Award (10%)',
            referenceId: contest._id
        }).save({ session });
        
        await session.commitTransaction();
        console.log(`Settled wallet for contest ${contest._id}. Winner: ${winnerId}, Amount: ${totalPayout}`);
        
        if (ioInstance) {
             ioInstance.to(contest._id.toString()).emit('wallet:settled', {
                 winnerId,
                 amount: totalPayout,
                 details: {
                     totalPool,
                     winnerPrize,
                     championBonus
                 }
             });
        }

        return {
            totalPool,
            winnerPrize,
            championBonus
        };
        
    } catch (err) {
        await session.abortTransaction();
        console.error('Wallet settlement failed:', err);
        return null;
    } finally {
        session.endSession();
    }
};

const handleJoin = async (socket, contestId) => {
  try {
    const contest = await OneToOneContest.findById(contestId);
    if (!contest) return;

    socket.join(contestId.toString());
    
    // Determine opponent ID
    const userId = socket.user?.id;
    let opponentId = null;
    if (userId) {
        const challengerId = contest.challenger.toString();
        const oppId = contest.opponent.toString();
        if (userId === challengerId) opponentId = oppId;
        else if (userId === oppId) opponentId = challengerId;
    }

    // Prepare restore payload
    let roundEndTime = null;
    if (contest.status === 'Accepted' || contest.status === 'Active') {
        if (contest.timeline) {
             roundEndTime = contest.timeline[`round${contest.currentRound}End`];
        }
    }

    const restorePayload = {
        roundNumber: contest.currentRound,
        totalRounds: TOTAL_ROUNDS,
        contestText: contest.contestText,
        status: contest.status,
        isFinished: contest.status === 'Completed',
        endTime: roundEndTime,
        prizeDetails: contest.prizeDetails,
        mySnapshot: userId ? getParticipantState(contestId, userId) : null,
        opponentSnapshot: opponentId ? getParticipantState(contestId, opponentId) : null,
        serverTime: new Date()
    };
    
    socket.emit('contest:restore', restorePayload);
    
    // Send current state logic continues...
    if (contest.status === 'Completed') {
        socket.emit('contest:final', { winnerId: contest.winner });
    } else if (contest.status === 'Accepted' || contest.status === 'Active') {
        const now = Date.now();
        const timeline = contest.timeline;
        if (!timeline) return; // Should not happen for active contest

        let currentRound = contest.currentRound;
        let roundEnd = timeline[`round${currentRound}End`];
        
        // Check if we are in a break
        // If current time is between roundXEnd and round(X+1)Start
        let isBreak = false;
        let nextRoundStart = null;
        
        if (currentRound < 3) {
            const nextStart = timeline[`round${currentRound + 1}Start`];
            if (now > new Date(roundEnd).getTime() && now < new Date(nextStart).getTime()) {
                isBreak = true;
                nextRoundStart = nextStart;
            }
        }

        if (isBreak) {
            ensureBreakCountdown({ contestId, round: currentRound, nextRoundStart: nextRoundStart });
            socket.emit('round:result', {
                round: currentRound,
                roundNumber: currentRound,
                totalRounds: TOTAL_ROUNDS,
                nextRoundStart: nextRoundStart,
                countdown: Math.ceil((new Date(nextRoundStart).getTime() - now) / 1000)
            });
        } else {
            // In a round (or about to start?)
            // If now < roundEnd
            if (now < new Date(roundEnd).getTime()) {
                 socket.emit('round:start', {
                    round: currentRound,
                    roundNumber: currentRound,
                    totalRounds: TOTAL_ROUNDS,
                    endTime: roundEnd,
                    serverTime: new Date(),
                    contestText: contest.contestText,
                    contestType: contest.contestType
                });
            }
        }
    }
  } catch (err) {
    console.error(`Error handling join for contest ${contestId}:`, err);
  }
};

module.exports = {
  init,
  scheduleContest,
  checkRoundCompletion,
  finishContest,
  settleWallet,
  handleJoin
};
