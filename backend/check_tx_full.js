
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect('mongodb+srv://typingcompetition:typingcompetition22%23@cluster0.b58ewro.mongodb.net/typing_competition?retryWrites=true&w=majority');
        
        console.log("--- Comprehensive Data Check (REMOTE DB) ---");

        const count = await Transaction.countDocuments();
        console.log(`Total Transactions: ${count}`);

        const distinctTypes = await Transaction.distinct('type');
        console.log("Distinct Transaction Types:", distinctTypes);

        const distinctStatuses = await Transaction.distinct('status');
        console.log("Distinct Statuses:", distinctStatuses);

        // Check sum by type
        const sumByType = await Transaction.aggregate([
            { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        console.log("Sum by Type:", JSON.stringify(sumByType, null, 2));

        // Check for huge amounts
        const huge = await Transaction.findOne({ amount: { $gt: 1000000 } });
        if (huge) {
            console.log("Found at least one huge transaction:", huge);
        } else {
            console.log("No transactions > 1,000,000 found.");
        }

        // Check for negative amounts
        const negative = await Transaction.findOne({ amount: { $lt: 0 } });
        if (negative) {
             console.log("Found negative transaction:", negative);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
