const { v4: uuidv4 } = require('crypto');

class MatchmakingService {
  constructor() {
    // Queue structure: { betAmount: [{ socketId, userId, username, joinedAt }] }
    this.queues = {
      10: [],
      50: [],
      100: [],
      500: [],
      1000: []
    };
    
    // Active games: { gameId: { player1, player2, betAmount, ... } }
    this.activeGames = new Map();
    
    // Player to game mapping: { socketId: gameId }
    this.playerGames = new Map();
    
    // Matchmaking timeout duration (20 seconds)
    this.MATCHMAKING_TIMEOUT = parseInt(process.env.MATCHMAKING_TIMEOUT) || 20000;
    
    // Bot win rate
    this.BOT_WIN_RATE = parseFloat(process.env.BOT_WIN_RATE) || 0.65;
  }

  // Add player to queue
  joinQueue(socketId, userId, username, betAmount) {
    if (!this.queues[betAmount]) {
      console.error(`Invalid bet amount: ${betAmount}`);
      return { success: false, message: 'Invalid bet amount' };
    }

    // Check if player is already in a queue
    for (const amount in this.queues) {
      const index = this.queues[amount].findIndex(p => p.socketId === socketId);
      if (index !== -1) {
        this.queues[amount].splice(index, 1);
      }
    }

    // Add to appropriate queue
    const player = {
      socketId,
      userId,
      username,
      betAmount,
      joinedAt: Date.now()
    };

    this.queues[betAmount].push(player);

    console.log(`✅ Player ${username} joined ${betAmount} queue. Queue size: ${this.queues[betAmount].length}`);

    // Try to find a match immediately
    const match = this.findMatch(betAmount, socketId);
    
    if (match) {
      return { success: true, matched: true, match };
    }

    // Set timeout for bot match
    const timeoutId = setTimeout(() => {
      this.handleMatchmakingTimeout(socketId, betAmount);
    }, this.MATCHMAKING_TIMEOUT);

    player.timeoutId = timeoutId;

    return { 
      success: true, 
      matched: false, 
      queueSize: this.queues[betAmount].length,
      timeout: this.MATCHMAKING_TIMEOUT 
    };
  }

  // Leave queue
  leaveQueue(socketId) {
    for (const amount in this.queues) {
      const index = this.queues[amount].findIndex(p => p.socketId === socketId);
      if (index !== -1) {
        const player = this.queues[amount][index];
        
        // Clear timeout
        if (player.timeoutId) {
          clearTimeout(player.timeoutId);
        }
        
        this.queues[amount].splice(index, 1);
        console.log(`❌ Player left ${amount} queue. Queue size: ${this.queues[amount].length}`);
        return { success: true };
      }
    }
    return { success: false, message: 'Player not in queue' };
  }

  // Find a match in the queue
  findMatch(betAmount, excludeSocketId = null) {
    const queue = this.queues[betAmount];
    
    if (queue.length < 2) {
      return null;
    }

    // Find two players (excluding the one who just joined if specified)
    const availablePlayers = queue.filter(p => p.socketId !== excludeSocketId);
    
    if (availablePlayers.length === 0 && queue.length >= 2) {
      // If we excluded someone, try with all players
      return this.createMatch(queue[0], queue[1], betAmount);
    }

    if (availablePlayers.length > 0 && queue.length >= 2) {
      const player1 = queue.find(p => p.socketId === excludeSocketId) || queue[0];
      const player2 = availablePlayers[0];
      return this.createMatch(player1, player2, betAmount);
    }

    return null;
  }

  // Create a match between two players
  createMatch(player1, player2, betAmount, isBot = false) {
    const gameId = uuidv4();
    
    // Remove players from queue
    const queue = this.queues[betAmount];
    this.queues[betAmount] = queue.filter(
      p => p.socketId !== player1.socketId && p.socketId !== player2.socketId
    );

    // Clear timeouts
    if (player1.timeoutId) clearTimeout(player1.timeoutId);
    if (player2.timeoutId) clearTimeout(player2.timeoutId);

    // Create game
    const game = {
      gameId,
      player1: {
        socketId: player1.socketId,
        userId: player1.userId,
        username: player1.username
      },
      player2: {
        socketId: player2.socketId,
        userId: player2.userId,
        username: player2.username,
        isBot
      },
      betAmount,
      potAmount: betAmount * 2,
      createdAt: Date.now(),
      state: 'matched'
    };

    this.activeGames.set(gameId, game);
    this.playerGames.set(player1.socketId, gameId);
    this.playerGames.set(player2.socketId, gameId);

    console.log(`🎮 Match created: ${player1.username} vs ${player2.username} (${betAmount})`);

    return game;
  }

  // Handle matchmaking timeout - pair with bot
  handleMatchmakingTimeout(socketId, betAmount) {
    const queue = this.queues[betAmount];
    const playerIndex = queue.findIndex(p => p.socketId === socketId);

    if (playerIndex === -1) {
      return; // Player already matched or left queue
    }

    const player = queue[playerIndex];

    // Create bot opponent
    const bot = {
      socketId: `bot-${uuidv4()}`,
      userId: 'bot',
      username: 'House Bot',
      betAmount,
      joinedAt: Date.now()
    };

    console.log(`🤖 Matchmaking timeout: Pairing ${player.username} with bot`);

    // Create match with bot
    const match = this.createMatch(player, bot, betAmount, true);

    return { 
      matched: true, 
      withBot: true, 
      match,
      botWinRate: this.BOT_WIN_RATE 
    };
  }

  // Get game by gameId
  getGame(gameId) {
    return this.activeGames.get(gameId);
  }

  // Get game by player socket ID
  getGameByPlayer(socketId) {
    const gameId = this.playerGames.get(socketId);
    if (gameId) {
      return this.activeGames.get(gameId);
    }
    return null;
  }

  // Update game state
  updateGame(gameId, updates) {
    const game = this.activeGames.get(gameId);
    if (game) {
      Object.assign(game, updates);
      this.activeGames.set(gameId, game);
    }
  }

  // End game
  endGame(gameId) {
    const game = this.activeGames.get(gameId);
    if (game) {
      this.playerGames.delete(game.player1.socketId);
      this.playerGames.delete(game.player2.socketId);
      this.activeGames.delete(gameId);
      console.log(`🏁 Game ended: ${gameId}`);
    }
  }

  // Handle rematch request
  handleRematchRequest(gameId, playerSocketId) {
    const game = this.activeGames.get(gameId);
    if (!game) return { success: false, message: 'Game not found' };

    // Mark player's rematch request
    if (game.player1.socketId === playerSocketId) {
      game.player1.wantsRematch = true;
    } else if (game.player2.socketId === playerSocketId) {
      game.player2.wantsRematch = true;
    }

    // Check if both players want rematch
    if (game.player1.wantsRematch && game.player2.wantsRematch) {
      // Reset rematch flags and create new game
      game.player1.wantsRematch = false;
      game.player2.wantsRematch = false;
      
      return { 
        success: true, 
        rematch: true,
        message: 'Both players ready for rematch' 
      };
    }

    return { 
      success: true, 
      rematch: false,
      message: 'Waiting for opponent' 
    };
  }

  // Get queue statistics
  getQueueStats() {
    const stats = {};
    for (const amount in this.queues) {
      stats[amount] = this.queues[amount].length;
    }
    return stats;
  }

  // Clean up disconnected player
  handleDisconnect(socketId) {
    // Remove from queue
    this.leaveQueue(socketId);

    // End active game if player was in one
    const gameId = this.playerGames.get(socketId);
    if (gameId) {
      const game = this.activeGames.get(gameId);
      if (game) {
        // Notify opponent
        return { 
          gameId, 
          game,
          opponentSocketId: game.player1.socketId === socketId 
            ? game.player2.socketId 
            : game.player1.socketId
        };
      }
    }

    return null;
  }
}

module.exports = new MatchmakingService();
