const Contest = require('../models/Contest');
const Round = require('../models/Round');
const Performance = require('../models/Performance');
const walletService = require('./walletService');
const { generateContestText } = require('../utils/textGenerator');

let ioInstance;

exports.init = (io) => {
  ioInstance = io;
  schedulePendingContests();
  // Check every minute for any missed contests
  setInterval(schedulePendingContests, 60000);
};

const schedulePendingContests = async () => {
  try {
    const now = new Date();
    // Find contests that are SCHEDULED and haven't started yet (or just missed start time)
    // We also look for contests that should have started but server was down.
    const upcomingContests = await Contest.find({
      status: 'SCHEDULED',
      scheduledStartTime: { $gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // Look back 24h max
    });

    upcomingContests.forEach(contest => {
      const timeUntilStart = new Date(contest.scheduledStartTime).getTime() - Date.now();
      // If timeUntilStart is negative, it means we are late. Start immediately?
      // Strict rule: "Contest must start at the scheduled exact server time."
      // If we are late, we should probably start it immediately and catch up, or just start round 1 now.
      // For simplicity, we start immediately if late but within reasonable window.
      
      const delay = Math.max(0, timeUntilStart);
      if (delay < 24 * 60 * 60 * 1000) {
         // Avoid double scheduling if already running (though init is usually called once)
         // We can use a Map to track scheduled timeouts if needed, but for now simple setTimeout is ok.
         setTimeout(() => startContest(contest._id), delay);
      }
    });
  } catch (err) {
    console.error('Error scheduling contests:', err);
  }
};

exports.scheduleContest = (contestId, startTime) => {
    const timeUntilStart = new Date(startTime).getTime() - Date.now();
    if (timeUntilStart > 0) {
        setTimeout(() => startContest(contestId), timeUntilStart);
    }
};

const startContest = async (contestId) => {
    try {
        const contest = await Contest.findById(contestId);
        if (!contest || contest.status !== 'SCHEDULED') return;

        console.log(`Starting contest ${contestId}`);
        contest.status = 'ACTIVE';
        await contest.save();

        if (ioInstance) ioInstance.to(contestId.toString()).emit('contest:started');

        // Generate Rounds
        for (let i = 1; i <= 3; i++) {
            const text = generateContestText(contest.category, `${contestId}-${i}`);
            // Calculate timings based on NOW to ensure synchronization
            // Round 1 starts NOW.
            // Round 2 starts NOW + 5m + 10s.
            // Round 3 starts NOW + 10m + 20s.
            const roundStartDelay = (i - 1) * (5 * 60 * 1000 + 10000);
            const startTime = new Date(Date.now() + roundStartDelay);
            const endTime = new Date(startTime.getTime() + 5 * 60 * 1000);

            const round = new Round({
                contestId,
                roundNumber: i,
                text,
                startTime,
                endTime
            });
            await round.save();
            
            // Schedule Round Execution
            setTimeout(() => runRound(contestId, i), roundStartDelay);
        }

    } catch (err) {
        console.error(`Error starting contest ${contestId}:`, err);
    }
};

const runRound = async (contestId, roundNumber) => {
    try {
        console.log(`Starting Round ${roundNumber} for contest ${contestId}`);
        const round = await Round.findOne({ contestId, roundNumber });
        if (!round) return;

        if (ioInstance) ioInstance.to(contestId.toString()).emit('round:start', { roundNumber, text: round.text, endTime: round.endTime });

        const duration = 5 * 60 * 1000; // 5 mins
        setTimeout(() => endRound(contestId, roundNumber), duration);
    } catch (err) {
        console.error(`Error running round ${roundNumber} for contest ${contestId}:`, err);
    }
};

const endRound = async (contestId, roundNumber) => {
    try {
        console.log(`Ending Round ${roundNumber} for contest ${contestId}`);
        if (ioInstance) ioInstance.to(contestId.toString()).emit('round:end', { roundNumber });

        // Fetch performances to show results
        const perfs = await Performance.find({ contestId, roundNumber }).populate('userId', 'username');
        if (ioInstance) ioInstance.to(contestId.toString()).emit('result:show', { roundNumber, results: perfs });

        if (roundNumber === 3) {
             setTimeout(() => finalizeContest(contestId), 10000); // 10s after last round
        }
    } catch (err) {
        console.error(`Error ending round ${roundNumber} for contest ${contestId}:`, err);
    }
};

const finalizeContest = async (contestId) => {
    try {
        console.log(`Finalizing contest ${contestId}`);
        const contest = await Contest.findById(contestId);
        if (!contest) return;

        contest.status = 'COMPLETED';
        
        const p1Id = contest.createdBy;
        const p2Id = contest.acceptedBy;
        
        // If p2 never joined/accepted? 
        // Logic: "If someone wins 2 rounds -> Winner". 
        // "Missing user gets 0 performance".
        
        // We need all perfs
        const allPerfs = await Performance.find({ contestId });

        let p1Wins = 0;
        let p2Wins = 0;

        for (let r = 1; r <= 3; r++) {
            const p1Perf = allPerfs.find(p => p.roundNumber === r && p.userId.equals(p1Id));
            const p2Perf = allPerfs.find(p => p.roundNumber === r && p.userId.equals(p2Id));

            const p1Speed = p1Perf ? p1Perf.netSpeed : 0;
            const p2Speed = p2Perf ? p2Perf.netSpeed : 0;

            if (p1Speed > p2Speed) p1Wins++;
            else if (p2Speed > p1Speed) p2Wins++;
        }

        let winnerId = null;
        if (p1Wins >= 2) winnerId = p1Id;
        else if (p2Wins >= 2) winnerId = p2Id;
        else {
            // Tie breaker: Round 3 Net Speed
            const p1PerfR3 = allPerfs.find(p => p.roundNumber === 3 && p.userId.equals(p1Id));
            const p2PerfR3 = allPerfs.find(p => p.roundNumber === 3 && p.userId.equals(p2Id));
            const p1Speed = p1PerfR3 ? p1PerfR3.netSpeed : 0;
            const p2Speed = p2PerfR3 ? p2PerfR3.netSpeed : 0;
            
            if (p1Speed > p2Speed) winnerId = p1Id;
            else if (p2Speed > p1Speed) winnerId = p2Id;
            // If absolute tie (unlikely with double precision or just 0 vs 0), no winner? 
            // Or p1 wins by default? Let's leave null if absolute tie.
        }

        if (winnerId) {
            contest.winner = winnerId;
            // Distribute Prize
            // Entry Fee from BOTH users = 2 * entryFee
            const totalPool = contest.entryFee * 2; 
            await walletService.distributeWinnings(contestId, winnerId, totalPool);
        }
        
        await contest.save();
        if (ioInstance) ioInstance.to(contestId.toString()).emit('contest:final', { winnerId });

    } catch (err) {
        console.error(`Error finalizing contest ${contestId}:`, err);
    }
};
