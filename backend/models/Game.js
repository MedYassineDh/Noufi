const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  player1: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    cards: [String],
    score: Number,
    socketId: String
  },
  player2: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    cards: [String],
    score: Number,
    socketId: String,
    isBot: {
      type: Boolean,
      default: false
    }
  },
  betAmount: {
    type: Number,
    required: true,
    min: 0
  },
  potAmount: {
    type: Number,
    required: true
  },
  winner: {
    type: String,
    enum: ['player1', 'player2', 'tie', null],
    default: null
  },
  gameState: {
    type: String,
    enum: ['waiting', 'dealing', 'revealing', 'completed', 'cancelled'],
    default: 'waiting'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  rematchRequests: {
    player1: {
      type: Boolean,
      default: false
    },
    player2: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSchema.index({ gameId: 1 });
gameSchema.index({ 'player1.userId': 1 });
gameSchema.index({ 'player2.userId': 1 });
gameSchema.index({ gameState: 1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
