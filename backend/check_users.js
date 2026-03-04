const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is missing in .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const totalUsers = await User.countDocuments({});
    console.log(`Total users in DB: ${totalUsers}`);

    const userRoleUsers = await User.find({ role: 'user' });
    console.log(`Users with role 'user': ${userRoleUsers.length}`);
    userRoleUsers.forEach(u => console.log(`- ${u.username} (${u._id})`));

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
