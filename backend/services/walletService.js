const User = require('../models/User');
const AdminWallet = require('../models/AdminWallet');
const WalletTransaction = require('../models/WalletTransaction');

exports.deductEntryFee = async (userId, amount, referenceId, options = {}) => {
  const session = options.session;
  const type = options.type || 'CONTEST_ENTRY';
  const description = options.description;

  const userQuery = User.findById(userId);
  if (session) userQuery.session(session);
  const user = await userQuery;
  if (!user) throw new Error('User not found');
  if (user.walletBalance < amount) throw new Error('Insufficient balance');

  user.walletBalance -= amount;
  await user.save(session ? { session } : {});

  const transaction = new WalletTransaction({
    userId,
    amount: -amount,
    type,
    description,
    reference: referenceId
  });
  await transaction.save(session ? { session } : {});

  // Add to Admin Wallet (Escrow)
  const adminWalletQuery = AdminWallet.findOne();
  if (session) adminWalletQuery.session(session);
  let adminWallet = await adminWalletQuery;
  if (!adminWallet) {
    adminWallet = new AdminWallet();
  }
  adminWallet.balance += amount;
  adminWallet.updatedAt = new Date();
  await adminWallet.save(session ? { session } : {});
};

exports.distributeWinnings = async (contestId, winnerId, totalPool) => {
  // 70% to Winner, 20% to Admin, 10% to Champion (Winner for now)
  // Total Winner = 80%, Admin = 20%
  const winnerAmount = totalPool * 0.8;
  // Admin revenue stays in wallet, so we only deduct winnerAmount

  let adminWallet = await AdminWallet.findOne();
  if (!adminWallet) throw new Error('Admin wallet not found');

  if (adminWallet.balance < winnerAmount) {
     // Should not happen if logic is correct
     console.error("CRITICAL: Admin wallet balance insufficient for payout!");
     // Proceed anyway to ensure user gets paid if possible or throw error?
     // For now, we assume consistency.
  }

  adminWallet.balance -= winnerAmount;
  await adminWallet.save();

  const winner = await User.findById(winnerId);
  if (winner) {
    winner.walletBalance += winnerAmount;
    await winner.save();

    await new WalletTransaction({
      userId: winnerId,
      amount: winnerAmount,
      type: 'CONTEST_PRIZE',
      reference: contestId
    }).save();
  }
};
