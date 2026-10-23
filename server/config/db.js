const mongoose = require('mongoose');
const { seedDemoUsers } = require('../services/userService');
const { seedDatabase } = require('../services/inventoryService');

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return;
  }

  // Avoid buffering commands when disconnected so requests return immediately
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedDemoUsers();
    await seedDatabase();
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.log('💡 Running in Demo / In-Memory Mode with pre-configured dummy accounts');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', async () => {
  console.log('🔄 MongoDB reconnected');
  await seedDemoUsers();
  await seedDatabase();
});

module.exports = connectDB;
