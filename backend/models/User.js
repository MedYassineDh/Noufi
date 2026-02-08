const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  balance: {
    type: Number,
    default: process.env.DEFAULT_STARTING_BALANCE || 1000,
    min: [0, 'Balance cannot be negative']
  },
  wins: {
    type: Number,
    default: 0,
    min: 0
  },
  losses: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGamesPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  gameHistory: [{
    opponent: String,
    betAmount: Number,
    result: {
      type: String,
      enum: ['win', 'loss', 'tie']
    },
    playerCards: [String],
    opponentCards: [String],
    playerScore: Number,
    opponentScore: Number,
    winAmount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get win rate
userSchema.methods.getWinRate = function() {
  if (this.totalGamesPlayed === 0) return 0;
  return ((this.wins / this.totalGamesPlayed) * 100).toFixed(2);
};

// Method to update game stats
userSchema.methods.updateGameStats = async function(result, betAmount) {
  this.totalGamesPlayed += 1;
  
  if (result === 'win') {
    this.wins += 1;
    this.balance += betAmount;
    this.totalWinnings += betAmount;
  } else if (result === 'loss') {
    this.losses += 1;
    this.balance -= betAmount;
    this.totalLosses += betAmount;
  }
  // For ties, balance remains the same
  
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
