const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

// Default built-in demo credentials
const DEFAULT_DEMO_USERS = [
  {
    _id: '660000000000000000000001',
    name: 'Demo Admin',
    email: 'admin@stocksense.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '660000000000000000000002',
    name: 'Demo Staff',
    email: 'staff@stocksense.com',
    passwordHash: bcrypt.hashSync('staff123', 10),
    role: 'staff',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory user store for development/demo mode when MongoDB is not running
let inMemoryUsers = [...DEFAULT_DEMO_USERS];

const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Seed demo users to MongoDB if connected
const seedDemoUsers = async () => {
  if (!isMongoConnected()) return;

  try {
    for (const demoUser of DEFAULT_DEMO_USERS) {
      const exists = await User.findOne({ email: demoUser.email });
      if (!exists) {
        // Plaintext password for User.create because pre('save') hashes it
        const plainPassword = demoUser.email.startsWith('admin') ? 'admin123' : 'staff123';
        await User.create({
          _id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          passwordHash: plainPassword,
          role: demoUser.role,
        });
        console.log(`👤 Seeded demo user: ${demoUser.email}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not seed demo users to MongoDB:', err.message);
  }
};

const findUserByEmail = async (email, { includePassword = false } = {}) => {
  const normalizedEmail = (email || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const query = User.findOne({ email: normalizedEmail });
    if (includePassword) query.select('+passwordHash');
    return await query.exec();
  }

  // Fallback to in-memory store
  const user = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;

  const userCopy = { ...user };
  if (!includePassword) {
    delete userCopy.passwordHash;
  }
  return userCopy;
};

const findUserById = async (id) => {
  if (isMongoConnected()) {
    return await User.findById(id).select('-passwordHash');
  }

  const user = inMemoryUsers.find((u) => String(u._id) === String(id));
  if (!user) return null;

  const userCopy = { ...user };
  delete userCopy.passwordHash;
  return userCopy;
};

const createUser = async ({ name, email, password, role }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: password,
      role: role || 'staff',
    });
    return user.toJSON();
  }

  // Create in in-memory store
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    name,
    email: normalizedEmail,
    passwordHash,
    role: role || 'staff',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryUsers.push(newUser);

  const returnedUser = { ...newUser };
  delete returnedUser.passwordHash;
  return returnedUser;
};

const comparePassword = async (user, candidatePassword) => {
  if (user && typeof user.comparePassword === 'function') {
    return user.comparePassword(candidatePassword);
  }
  if (!user || !user.passwordHash) return false;
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

module.exports = {
  isMongoConnected,
  seedDemoUsers,
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
  DEFAULT_DEMO_USERS,
};
