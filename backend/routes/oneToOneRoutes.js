const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const OneToOneContest = require('../models/OneToOneContest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AdminWallet = require('../models/AdminWallet');
const WalletTransaction = require('../models/WalletTransaction');
const Transaction = require('../models/Transaction'); // Import Transaction model
const mongoose = require('mongoose');
const { scheduleContest, checkRoundCompletion, finishContest, settleWallet } = require('../services/contestScheduler');
const walletService = require('../services/walletService');
const { 
    getLiveRoom, 
    getParticipantState, 
    hasParticipated,
    removeLiveRoom 
} = require('../services/liveContestState');

const { generateContestText, hashText, normalizeText } = require('../utils/textGenerator');

const normalizeContestMode = (value) => {
    const raw = String(value || '').trim();
    const lower = raw.toLowerCase();
    if (!lower) return '';
    if (lower === 'paid' || lower.includes('paid')) return 'Paid Contest';
    if (lower === 'free' || lower.includes('free')) return 'Free Contest';
    return raw;
};

const calculateStats = ({ targetText, typedText, timeUsedSec }) => {
    const target = normalizeText(targetText);
    const typed = normalizeText(typedText);

    const typedChars = typed.length;
    let correctChars = 0;
    const minLen = Math.min(target.length, typed.length);
    for (let i = 0; i < minLen; i++) {
        if (target[i] === typed[i]) correctChars++;
    }

    const minutes = Math.max(1 / 60, Number(timeUsedSec || 0) / 60);
    const grossWpm = Math.round((typedChars / 5) / minutes);
    const netWpm = Math.round((correctChars / 5) / minutes);
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

    return { typedChars, correctChars, grossWpm, netWpm, accuracy };
};

const sendSse = (res, payload) => {
    if (!res || res.writableEnded) return;
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const broadcastSse = (contestId, payload) => {
    const room = getLiveRoom(contestId);
    if (!room) return;
    for (const client of room.clients) {
        sendSse(client, payload);
    }
};

const getOpponentId = (contest, userId) => {
    const me = String(userId || '');
    const challenger = String(contest?.challenger?._id || contest?.challenger || '');
    const opponent = String(contest?.opponent?._id || contest?.opponent || '');
    if (me && me === challenger) return opponent;
    if (me && me === opponent) return challenger;
    return '';
};

// @route   POST api/one-to-one/create
// @desc    Create a new one-to-one contest request
// @access  Private
router.post('/create', auth, async (req, res) => {
    try {
        const { opponentId, contestType, contestMode, entryFee, scheduledTime } = req.body;
        const normalizedContestMode = normalizeContestMode(contestMode);
        const isPaidContest = normalizedContestMode === 'Paid Contest';
        const normalizedEntryFee = Number(entryFee);

        // Validation
        if (!opponentId || !contestType || !normalizedContestMode || !scheduledTime) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        if (isPaidContest && (!Number.isFinite(normalizedEntryFee) || normalizedEntryFee <= 0)) {
            return res.status(400).json({ message: 'Entry fee is required for paid contests' });
        }

        const challenger = await User.findById(req.user.id);
        const opponent = await User.findById(opponentId);

        if (!opponent) {
            return res.status(404).json({ message: 'Opponent not found' });
        }

        // Check Balance for Paid Contest
        if (isPaidContest) {
            if (challenger.walletBalance < normalizedEntryFee) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
            // Optional: Deduct or hold amount here. For now, we'll just check.
            // A robust system would deduct here or on acceptance.
        }

        const newContest = new OneToOneContest({
            challenger: req.user.id,
            opponent: opponentId,
            contestType,
            contestMode: normalizedContestMode,
            entryFee: isPaidContest ? normalizedEntryFee : 0,
            scheduledTime,
            durationSec: 300,
            contestText: ''
        });
        newContest.contestText = generateContestText(contestType, String(newContest._id));

    const contest = await newContest.save();

        // Populate for socket
        await contest.populate('challenger', 'username uniqueKey');
        await contest.populate('opponent', 'username uniqueKey');

        // Notify opponent via socket
        if (req.io) {
            req.io.to(opponentId).emit('invitation:new', contest);
        }

        res.status(201).json(contest);

    } catch (err) {
        console.error(err.message);
        // If validation error, return 400 with details
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT api/one-to-one/accept/:id
// @desc    Accept a contest request
// @access  Private
router.put('/accept/:id', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        let contest;
        try {
            contest = await OneToOneContest.findById(contestId).session(session);
            if (!contest) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Contest not found' });
            }

            if (String(contest.opponent) !== String(req.user.id)) {
                await session.abortTransaction();
                return res.status(401).json({ message: 'Not authorized to accept this contest' });
            }

            if (contest.status !== 'Pending') {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Contest is not pending' });
            }

            // If paid contest, handle wallet deduction
            const normalizedContestMode = normalizeContestMode(contest.contestMode);
            const entryFee = Number(contest.entryFee);
            const isPaidContest = normalizedContestMode === 'Paid Contest' && Number.isFinite(entryFee) && entryFee > 0;
            if (normalizedContestMode && contest.contestMode !== normalizedContestMode) {
                contest.contestMode = normalizedContestMode;
            }

            if (isPaidContest) {
                    if (entryFee <= 0) {
                        console.error(`[ACCEPT] Invalid entry fee for paid contest ${contestId}: ${entryFee}`);
                        // Should theoretically be caught by isPaidContest check, but safe to log
                    }

                    const opponentUser = await User.findById(req.user.id).session(session);
                    const challengerUser = await User.findById(contest.challenger).session(session);

                    if (!opponentUser || !challengerUser) {
                        await session.abortTransaction();
                        return res.status(404).json({ message: 'User not found' });
                    }
                    
                    console.log(`[ACCEPT] Processing wallet deduction for Contest ${contestId}. Entry Fee: ${entryFee}`);
                    
                    // Check balances again within transaction
                    if (opponentUser.walletBalance < entryFee) {
                        console.log(`[ACCEPT] Opponent ${opponentUser._id} insufficient balance: ${opponentUser.walletBalance} < ${entryFee}`);
                        await session.abortTransaction();
                        return res.status(400).json({ message: 'Insufficient wallet balance' });
                    }
                    if (challengerUser.walletBalance < entryFee) {
                        console.log(`[ACCEPT] Challenger ${challengerUser._id} insufficient balance: ${challengerUser.walletBalance} < ${entryFee}`);
                        await session.abortTransaction();
                        return res.status(400).json({ message: 'Challenger has insufficient wallet balance' });
                    }

                    // Find or create Admin Wallet
                    let adminWallet = await AdminWallet.findOne().session(session);
                    if (!adminWallet) {
                        console.log(`[ACCEPT] Admin wallet missing, creating new one.`);
                        adminWallet = new AdminWallet({ balance: 0 });
                        await adminWallet.save({ session });
                    }

                    // Deduct from Opponent
                    console.log(`[DEDUCT] Opponent ${opponentUser._id} balance BEFORE: ${opponentUser.walletBalance}, Deducting: ${entryFee}`);
                    opponentUser.walletBalance -= entryFee;
                    await opponentUser.save({ session });
                    console.log(`[DEDUCT] Opponent ${opponentUser._id} balance AFTER: ${opponentUser.walletBalance}`);
                    
                    // Create WalletTransaction (User History)
                    await new WalletTransaction({
                        userId: opponentUser._id,
                        amount: -entryFee,
                        type: 'CONTEST_ENTRY',
                        reference: contest._id,
                        description: `Entry fee for One-to-One Contest ${contest._id}`
                    }).save({ session });

                    // Create Transaction (System Metrics)
                    await new Transaction({
                        userId: opponentUser._id,
                        amount: entryFee, // Positive amount for 'Contest Fee' implies spending
                        type: 'Contest Fee',
                        status: 'Completed',
                        description: `Entry fee for One-to-One Contest ${contest._id}`,
                        referenceId: contest._id
                    }).save({ session });

                    // Deduct from Challenger
                    console.log(`[DEDUCT] Challenger ${challengerUser._id} balance BEFORE: ${challengerUser.walletBalance}, Deducting: ${entryFee}`);
                    challengerUser.walletBalance -= entryFee;
                    await challengerUser.save({ session });
                    console.log(`[DEDUCT] Challenger ${challengerUser._id} balance AFTER: ${challengerUser.walletBalance}`);

                    // Create WalletTransaction (User History)
                    await new WalletTransaction({
                        userId: challengerUser._id,
                        amount: -entryFee,
                        type: 'CONTEST_ENTRY',
                        reference: contest._id,
                        description: `Entry fee for One-to-One Contest ${contest._id}`
                    }).save({ session });

                    // Create Transaction (System Metrics)
                    await new Transaction({
                        userId: challengerUser._id,
                        amount: entryFee, // Positive amount for 'Contest Fee' implies spending
                        type: 'Contest Fee',
                        status: 'Completed',
                        description: `Entry fee for One-to-One Contest ${contest._id}`,
                        referenceId: contest._id
                    }).save({ session });

                    // Credit to Admin Wallet (Escrow)
                    const totalPot = entryFee * 2;
                    console.log(`[CREDIT] Admin Wallet balance BEFORE: ${adminWallet.balance}, Adding: ${totalPot}`);
                    adminWallet.balance += totalPot;
                    await adminWallet.save({ session });
                    console.log(`[CREDIT] Admin Wallet balance AFTER: ${adminWallet.balance}`);
            }

            if (!contest.contestText) {
                contest.contestText = generateContestText(contest.contestType, String(contest._id));
            }
            
            // Set scheduledTime to now to ensure immediate start upon acceptance
            const start = new Date();
            contest.scheduledTime = start;
            contest.durationSec = 300; // Ensure 5 minutes duration

            const ROUND_DURATION = 300000; // 5 mins
            const BREAK_DURATION = 10000;  // 10 secs
            
            contest.timeline = {
                round1Start: start,
                round1End: new Date(start.getTime() + ROUND_DURATION),
                round2Start: new Date(start.getTime() + ROUND_DURATION + BREAK_DURATION),
                round2End: new Date(start.getTime() + 2 * ROUND_DURATION + BREAK_DURATION),
                round3Start: new Date(start.getTime() + 2 * ROUND_DURATION + 2 * BREAK_DURATION),
                round3End: new Date(start.getTime() + 3 * ROUND_DURATION + 2 * BREAK_DURATION),
                contestEnd: new Date(start.getTime() + 3 * ROUND_DURATION + 2 * BREAK_DURATION)
            };

            contest.currentRound = 1;
            contest.contestText = generateContestText(contest.contestType, `${String(contest._id)}::round1`);
            contest.status = 'Accepted';
            await contest.save({ session });

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }

        // Schedule contest
        scheduleContest(contest._id, contest.scheduledTime);

        // Notify Challenger & Opponent (Parallel Fetch)
        const [acceptor, challengerUser] = await Promise.all([
            User.findById(req.user.id).lean(),
            User.findById(contest.challenger).lean()
        ]);

        if (!acceptor) {
            console.error('Acceptor not found');
            return res.status(500).send('User not found');
        }

        const normalizedContestMode = normalizeContestMode(contest.contestMode);
        const entryFee = Number(contest.entryFee);
        const feeText = normalizedContestMode === 'Paid Contest' && Number.isFinite(entryFee) && entryFee > 0 ? ` Fee: ${entryFee}` : '';

        const challengerNotification = new Notification({
            user: contest.challenger,
            message: `${acceptor.username} has ACCEPTED your One-to-One Typing Contest invitation.${feeText}`,
            type: 'success'
        });

        const opponentNotification = new Notification({
            user: req.user.id,
            message: `You have ACCEPTED the One-to-One Typing Contest invitation from ${challengerUser ? challengerUser.username : 'Unknown User'}.${feeText}`,
            type: 'success'
        });

        // Save notifications in parallel
        await Promise.all([
            challengerNotification.save(),
            opponentNotification.save()
        ]);

        // Emit socket event for real-time updates
        if (req.io) {
            req.io.to(contest.challenger.toString()).emit('contest:accepted', contest);
            req.io.to(req.user.id.toString()).emit('contest:accepted', contest);
        }

        res.json(contest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/one-to-one/reject/:id
// @desc    Reject a contest request
// @access  Private
router.put('/reject/:id', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        const contest = await OneToOneContest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.opponent.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to reject this contest' });
        }

        if (contest.status !== 'Pending') {
            return res.status(400).json({ message: 'Contest is not pending' });
        }

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        if (!contest.contestText) {
            contest.contestText = generateContestText(contest.contestType, String(contest._id));
        }
        if (!contest.durationSec) {
            contest.durationSec = 300;
        }

        contest.status = 'Rejected';
        contest.rejectionReason = reason;
        await contest.save();

        // Notify Challenger
        const rejector = await User.findById(req.user.id);
        const challengerUser = await User.findById(contest.challenger);

        if (!rejector) {
             console.error('Rejector not found');
             return res.status(500).send('User not found');
        }

        const challengerNotification = new Notification({
            user: contest.challenger,
            message: `${rejector.username} has REJECTED your contest invitation. Reason: ${reason}`,
            type: 'error'
        });
        await challengerNotification.save();

        // Notify Opponent (Rejector)
        const opponentNotification = new Notification({
            user: req.user.id,
            message: `You have REJECTED the contest invitation from ${challengerUser ? challengerUser.username : 'Unknown User'}. Reason: ${reason}`,
            type: 'info'
        });
        await opponentNotification.save();

        res.json(contest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/one-to-one/unseen-invitations-count
// @desc    Get count of unseen pending invitations
// @access  Private
router.get('/unseen-invitations-count', auth, async (req, res) => {
    try {
        const count = await OneToOneContest.countDocuments({
            opponent: req.user.id,
            status: 'Pending',
            $or: [{ seenByOpponent: false }, { seenByOpponent: { $exists: false } }]
        });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/one-to-one/mark-invitations-seen
// @desc    Mark all pending invitations as seen
// @access  Private
router.put('/mark-invitations-seen', auth, async (req, res) => {
    try {
        await OneToOneContest.updateMany(
            { 
                opponent: req.user.id, 
                status: 'Pending',
                $or: [{ seenByOpponent: false }, { seenByOpponent: { $exists: false } }]
            },
            { seenByOpponent: true }
        );
        res.json({ msg: 'All invitations marked as seen' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/one-to-one/my-contests
// @desc    Get contests for current user
// @access  Private
router.get('/my-contests', auth, async (req, res) => {
    try {
        const contests = await OneToOneContest.find({
            $or: [{ challenger: req.user.id }, { opponent: req.user.id }]
        })
        .select('challenger opponent contestType contestMode entryFee scheduledTime status rejectionReason winner createdAt seenByOpponent contestText')
        .populate('challenger', 'username uniqueKey')
        .populate('opponent', 'username uniqueKey')
        .sort({ createdAt: -1 });

        // Ensure text exists
        for (const contest of contests) {
            if (!contest.contestText) {
                contest.contestText = generateContestText(contest.contestType, String(contest._id));
                await contest.save();
            }
        }

        res.json(contests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id/stream', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = await OneToOneContest.findById(contestId);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const userId = String(req.user.id);
        if (String(contest.challenger) !== userId && String(contest.opponent) !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this contest' });
        }

        res.status(200);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const room = getLiveRoom(contestId);
        room.clients.add(res);

        const snapshots = Array.from(room.snapshots.values());
        sendSse(res, { type: 'init', contestId, serverTimeMs: Date.now(), snapshots });

        const keepAlive = setInterval(() => {
            sendSse(res, { type: 'ping', t: Date.now() });
        }, 15000);

        req.on('close', () => {
            clearInterval(keepAlive);
            room.clients.delete(res);
            if (room.clients.size === 0 && room.snapshots.size === 0) {
                removeLiveRoom(contestId);
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/:id/typing', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = await OneToOneContest.findById(contestId);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const userId = String(req.user.id);
        if (String(contest.challenger) !== userId && String(contest.opponent) !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const nowMs = Date.now();
        const startMs = new Date(contest.scheduledTime).getTime();
        if (!Number.isNaN(startMs) && nowMs < startMs) {
            return res.status(400).json({ message: 'Contest has not started yet' });
        }

        const body = req.body || {};
        const typedText = typeof body.typedText === 'string' ? body.typedText.slice(0, 12000) : '';
        const lockedTypedWords = Array.isArray(body.lockedTypedWords)
            ? body.lockedTypedWords.slice(0, 200).map((w) => String(w).slice(0, 60))
            : [];
        const lockedCurrentWord = typeof body.lockedCurrentWord === 'string' ? body.lockedCurrentWord.slice(0, 80) : '';
        const viewportStartWord = Number.isFinite(Number(body.viewportStartWord)) ? Math.max(0, Number(body.viewportStartWord)) : 0;
        const completedChars = Number.isFinite(Number(body.completedChars)) ? Math.max(0, Math.floor(Number(body.completedChars))) : 0;
        const completedCorrectChars = Number.isFinite(Number(body.completedCorrectChars))
            ? Math.max(0, Math.floor(Number(body.completedCorrectChars)))
            : 0;

        const room = getLiveRoom(contestId);
        const nextSnapshot = {
            contestId,
            userId,
            typedText,
            typedChars: typedText.length,
            completedChars,
            completedCorrectChars,
            lockedTypedWords,
            lockedCurrentWord,
            viewportStartWord,
            lastTypedAtMs: nowMs
        };
        room.snapshots.set(userId, nextSnapshot);

        broadcastSse(contestId, { type: 'typing', contestId, userId, snapshot: nextSnapshot });

        const opponentId = getOpponentId(contest, userId);
        const elapsedSinceStartMs = Number.isNaN(startMs) ? 0 : Math.max(0, nowMs - startMs);
        if (opponentId && elapsedSinceStartMs >= 20000 && !hasParticipated(contestId, opponentId)) {
            const notifyKey = `${contestId}::${userId}`;
            if (!room.inactivityNotifiedFor.has(notifyKey)) {
                room.inactivityNotifiedFor.add(notifyKey);
                const notification = new Notification({
                    user: userId,
                    message: 'Opponent has not started typing yet.',
                    type: 'info'
                });
                await notification.save();
                broadcastSse(contestId, { type: 'opponent_inactive', contestId, userId, opponentId });
            }
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST api/one-to-one/:id/submit
// @desc    Submit contest result (computed server-side from typed text)
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = await OneToOneContest.findById(contestId);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const userId = String(req.user.id);
        if (String(contest.challenger) !== userId && String(contest.opponent) !== userId) {
            return res.status(403).json({ message: 'Not authorized to submit this contest' });
        }

        if (contest.status !== 'Accepted' && contest.status !== 'Completed') {
            return res.status(400).json({ message: 'Contest is not active' });
        }

        const nowMs = Date.now();
        const startMs = new Date(contest.scheduledTime).getTime();
        if (Number.isNaN(startMs)) {
            return res.status(400).json({ message: 'Contest schedule is invalid' });
        }
        if (nowMs < startMs) {
            return res.status(400).json({ message: 'Contest has not started yet' });
        }

        let changed = false;
        if (!contest.contestText) {
            contest.contestText = generateContestText(contest.contestType, String(contest._id));
            changed = true;
        }
        if (!contest.durationSec) {
            contest.durationSec = 300;
            changed = true;
        }
        if (changed) await contest.save();

        const durationSec = Number(contest.durationSec || 300);
        const elapsedSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        const timeUsedSec = Math.min(durationSec, elapsedSec);

        const body = req.body || {};
        const hasComputed =
            body &&
            typeof body === 'object' &&
            Number.isFinite(Number(body.typedChars)) &&
            Number.isFinite(Number(body.correctChars)) &&
            Number.isFinite(Number(body.grossWpm)) &&
            Number.isFinite(Number(body.netWpm)) &&
            Number.isFinite(Number(body.accuracy));

        const currentRound = contest.currentRound || 1;
        let nextResult;
        if (hasComputed) {
            const typedChars = Math.max(0, Math.floor(Number(body.typedChars)));
            const correctChars = Math.max(0, Math.floor(Number(body.correctChars)));
            const grossWpm = Math.max(0, Math.floor(Number(body.grossWpm)));
            const netWpm = Math.max(0, Math.floor(Number(body.netWpm)));
            const accuracy = Math.max(0, Math.min(100, Math.floor(Number(body.accuracy))));
            const clientTimeUsedSec = Number.isFinite(Number(body.timeUsedSec)) ? Math.max(0, Math.min(durationSec, Math.floor(Number(body.timeUsedSec)))) : timeUsedSec;
            const timeUsed = typeof body.timeUsed === 'string' ? body.timeUsed : undefined;
            const interrupted = typeof body.interrupted === 'boolean' ? body.interrupted : undefined;
            const difficultKeys = Array.isArray(body.difficultKeys) ? body.difficultKeys : undefined;

            nextResult = {
                user: req.user.id,
                round: currentRound,
                typedChars,
                correctChars,
                grossWpm,
                netWpm,
                accuracy,
                timeUsedSec: clientTimeUsedSec,
                timeUsed,
                interrupted,
                difficultKeys,
                submittedAt: new Date()
            };
        } else {
            const typedText = body?.typedText;
            if (typeof typedText !== 'string') {
                return res.status(400).json({ message: 'typedText or computed results are required' });
            }

            const stats = calculateStats({
                targetText: contest.contestText,
                typedText,
                durationSec
            });

            const timeUsed = typeof body.timeUsed === 'string' ? body.timeUsed : undefined;
            const interrupted = typeof body.interrupted === 'boolean' ? body.interrupted : undefined;
            const difficultKeys = Array.isArray(body.difficultKeys) ? body.difficultKeys : undefined;

            nextResult = {
                user: req.user.id,
                round: currentRound,
                typedChars: stats.typedChars,
                correctChars: stats.correctChars,
                grossWpm: stats.grossWpm,
                netWpm: stats.netWpm,
                accuracy: stats.accuracy,
                timeUsedSec,
                timeUsed,
                interrupted,
                difficultKeys,
                submittedAt: new Date()
            };
        }

        // Use findOneAndUpdate to avoid VersionError on concurrent submissions
        const updateQuery = { _id: contest._id, "results.user": userId, "results.round": currentRound };
        const updateDoc = { $set: { "results.$": nextResult } };
        
        let updatedContest = await OneToOneContest.findOneAndUpdate(updateQuery, updateDoc, { new: true });
        
        if (!updatedContest) {
            // Not found, so push new result
            updatedContest = await OneToOneContest.findOneAndUpdate(
                { _id: contest._id },
                { $push: { results: nextResult } },
                { new: true }
            );
        }

        // Check if round is complete (both players submitted)
        checkRoundCompletion(contest._id, currentRound).catch(err => {
            console.error(`Background checkRoundCompletion failed for contest ${contest._id}:`, err);
        });

        res.json({
            contestId: contest._id,
            status: contest.status,
            winner: contest.winner,
            yourResult: nextResult
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/one-to-one/:id/results
// @desc    Get contest results and winner
// @access  Private
router.get('/:id/results', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = await OneToOneContest.findById(contestId)
            .populate('challenger', 'username uniqueKey')
            .populate('opponent', 'username uniqueKey')
            .populate('winner', 'username uniqueKey')
            .populate('results.user', 'username uniqueKey');

        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const userId = String(req.user.id);
        if (String(contest.challenger?._id || contest.challenger) !== userId && String(contest.opponent?._id || contest.opponent) !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this contest' });
        }

        const nowMs = Date.now();
        const startMs = new Date(contest.scheduledTime).getTime();
        let changed = false;
        if (!contest.contestText) {
            contest.contestText = generateContestText(contest.contestType);
            changed = true;
        }
        if (!contest.durationSec) {
            contest.durationSec = 300;
            changed = true;
        }
        if (changed) await contest.save();

        const durationSec = Number(contest.durationSec || 300);
        const timelineEndMs = contest.timeline?.contestEnd ? new Date(contest.timeline.contestEnd).getTime() : NaN;
        const computedEndMs = startMs + (durationSec * 3 + 20) * 1000;
        const endMs = Number.isFinite(timelineEndMs) ? timelineEndMs : computedEndMs;

        const prevStatus = contest.status;
        if (contest.status !== 'Completed' && nowMs >= endMs) {
            await finishContest(contest._id);
            const updated = await OneToOneContest.findById(contest._id)
                .populate('challenger', 'username uniqueKey')
                .populate('opponent', 'username uniqueKey')
                .populate('winner', 'username uniqueKey')
                .populate('results.user', 'username uniqueKey');
            
            if (updated) {
                contest.status = updated.status;
                contest.winner = updated.winner;
                contest.completedAt = updated.completedAt;
                contest.prizeDetails = updated.prizeDetails;
                contest.results = updated.results;
            }
        }

        if (contest.status === 'Completed' && prevStatus !== 'Completed') {
            broadcastSse(contestId, { type: 'winner', contestId, winner: String(contest.winner || '') });
            const room = getLiveRoom(contestId);
            if (room && !room.completionNotified && contest.winner) {
                room.completionNotified = true;
                const winnerId = String(contest.winner || '');
                const loserId = getOpponentId(contest, winnerId);
                const isForfeit = Array.isArray(contest.results) && contest.results.length === 1;
                if (isForfeit && loserId) {
                    const winNote = new Notification({
                        user: winnerId,
                        message: 'You won the contest because your opponent did not participate.',
                        type: 'success'
                    });
                    const loseNote = new Notification({
                        user: loserId,
                        message: 'You lost the contest because you did not participate.',
                        type: 'error'
                    });
                    await Promise.all([winNote.save(), loseNote.save()]);
                }
            }
        }

        await contest.populate('winner', 'username uniqueKey');
        res.json({
            contestId: contest._id,
            status: contest.status,
            currentRound: contest.currentRound,
            isBreak: contest.isBreak,
            contestType: contest.contestType,
            contestMode: contest.contestMode,
            entryFee: contest.entryFee,
            scheduledTime: contest.scheduledTime,
            durationSec: contest.durationSec,
            challenger: contest.challenger,
            opponent: contest.opponent,
            winner: contest.winner,
            results: contest.results
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/one-to-one/:id
// @desc    Get specific contest details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const contestId = String(req.params.id || '').trim();
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = await OneToOneContest.findById(contestId)
            .select('challenger opponent status contestType scheduledTime durationSec contestText results winner entryFee contestMode createdAt currentRound prizeDetails')
            .populate('challenger', 'username uniqueKey')
            .populate('opponent', 'username uniqueKey');
        
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Ensure text exists
        if (!contest.contestText) {
            contest.contestText = generateContestText(contest.contestType, String(contest._id));
            await contest.save();
        }

        // Check if user is part of the contest
        const challengerId = contest.challenger?._id ? contest.challenger._id.toString() : String(contest.challenger || '');
        const opponentId = contest.opponent?._id ? contest.opponent._id.toString() : String(contest.opponent || '');
        
        if (challengerId !== req.user.id && opponentId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this contest' });
        }

        res.json(contest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
