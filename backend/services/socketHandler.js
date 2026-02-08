const matchmaking = require('./matchmaking');
const gameEngine = require('./gameEngine');
const User = require('../models/User');
const Game = require('../models/Game');

class SocketHandler {
  constructor(io) {
    this.io = io;
  }

  // Handle socket connections
  handleConnection(socket) {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // Update user online status
    User.findByIdAndUpdate(socket.user._id, { isOnline: true }).catch(console.error);

    // Join queue event
    socket.on('join_queue', async (data) => {
      await this.handleJoinQueue(socket, data);
    });

    // Leave queue event
    socket.on('leave_queue', () => {
      this.handleLeaveQueue(socket);
    });

    // Rematch request
    socket.on('rematch_request', async (data) => {
      await this.handleRematchRequest(socket, data);
    });

    // Change bet / return to lobby
    socket.on('return_to_lobby', async (data) => {
      await this.handleReturnToLobby(socket, data);
    });

    // Disconnect event
    socket.on('disconnect', async () => {
      await this.handleDisconnect(socket);
    });
  }

  // Handle join queue
  async handleJoinQueue(socket, data) {
    const { betAmount } = data;
    const user = socket.user;

    // Validate bet amount
    const validBets = [10, 50, 100, 500, 1000];
    if (!validBets.includes(betAmount)) {
      socket.emit('queue_error', { message: 'Invalid bet amount' });
      return;
    }

    // Check if user has sufficient balance
    if (user.balance < betAmount) {
      socket.emit('queue_error', { message: 'Insufficient balance' });
      return;
    }

    // Join matchmaking queue
    const result = matchmaking.joinQueue(
      socket.id,
      user._id.toString(),
      user.username,
      betAmount
    );

    if (!result.success) {
      socket.emit('queue_error', { message: result.message });
      return;
    }

    // Emit queue joined event
    socket.emit('queue_joined', {
      betAmount,
      queueSize: result.queueSize,
      timeout: result.timeout
    });

    // If matched immediately
    if (result.matched) {
      await this.startGame(result.match);
    } else {
      // Set timeout to pair with bot after 20 seconds
      setTimeout(() => {
        this.handleBotMatch(socket, betAmount);
      }, result.timeout);
    }
  }

  // Handle bot matching after timeout
  async handleBotMatch(socket, betAmount) {
    const game = matchmaking.getGameByPlayer(socket.id);
    
    // If player already matched, do nothing
    if (game) return;

    // Create bot match
    const botMatch = matchmaking.handleMatchmakingTimeout(socket.id, betAmount);
    
    if (botMatch && botMatch.matched) {
      socket.emit('matched_with_bot', {
        message: 'No opponent found. Playing against House Bot.',
        botWinRate: botMatch.botWinRate
      });

      await this.startGame(botMatch.match);
    }
  }

  // Handle leave queue
  handleLeaveQueue(socket) {
    const result = matchmaking.leaveQueue(socket.id);
    
    if (result.success) {
      socket.emit('queue_left', { message: 'Left matchmaking queue' });
    }
  }

  // Start a game
  async startGame(match) {
    const { gameId, player1, player2, betAmount } = match;

    // Get player sockets
    const player1Socket = this.io.sockets.sockets.get(player1.socketId);
    const player2Socket = player2.isBot 
      ? null 
      : this.io.sockets.sockets.get(player2.socketId);

    if (!player1Socket) {
      console.error('Player 1 socket not found');
      return;
    }

    // Notify both players
    player1Socket.emit('match_found', {
      gameId,
      opponent: player2.username,
      betAmount,
      potAmount: betAmount * 2,
      isBot: player2.isBot
    });

    if (player2Socket) {
      player2Socket.emit('match_found', {
        gameId,
        opponent: player1.username,
        betAmount,
        potAmount: betAmount * 2,
        isBot: false
      });
    }

    // Start game after brief delay (for UI transition)
    setTimeout(async () => {
      await this.playGame(gameId, match);
    }, 2000);
  }

  // Play the game
  async playGame(gameId, match) {
    const { player1, player2, betAmount } = match;
    const isBot = player2.isBot;

    // Play game using game engine
    const gameResult = gameEngine.playGame(
      { userId: player1.userId, username: player1.username },
      { userId: player2.userId, username: player2.username },
      betAmount,
      isBot
    );

    // Get sockets
    const player1Socket = this.io.sockets.sockets.get(player1.socketId);
    const player2Socket = isBot 
      ? null 
      : this.io.sockets.sockets.get(player2.socketId);

    // Emit dealing event
    if (player1Socket) {
      player1Socket.emit('game_dealing', {
        gameId,
        message: 'Dealer is shuffling cards...'
      });
    }
    if (player2Socket) {
      player2Socket.emit('game_dealing', {
        gameId,
        message: 'Dealer is shuffling cards...'
      });
    }

    // Simulate card reveal sequence (one by one for suspense)
    setTimeout(async () => {
      await this.revealCards(gameId, gameResult, player1Socket, player2Socket);
    }, 2000);
  }

  // Reveal cards with animation sequence
  async revealCards(gameId, gameResult, player1Socket, player2Socket) {
    const { player1, player2, winner, potAmount } = gameResult;

    // Create reveal sequence
    const revealSequence = gameEngine.createRevealSequence(
      player1.cards,
      player2.cards
    );

    // Send each reveal step with delay
    for (let i = 0; i < revealSequence.length; i++) {
      const reveal = revealSequence[i];

      await new Promise((resolve) => {
        setTimeout(() => {
          if (player1Socket) {
            player1Socket.emit('card_reveal', {
              step: reveal.step,
              playerCard: reveal.player1Card,
              opponentCard: reveal.player2Card
            });
          }

          if (player2Socket) {
            player2Socket.emit('card_reveal', {
              step: reveal.step,
              playerCard: reveal.player2Card,
              opponentCard: reveal.player1Card
            });
          }

          resolve();
        }, reveal.delay * i);
      });
    }

    // After all cards revealed, show results
    setTimeout(async () => {
      await this.showGameResults(gameId, gameResult, player1Socket, player2Socket);
    }, 1500);
  }

  // Show game results and update balances
  async showGameResults(gameId, gameResult, player1Socket, player2Socket) {
    const { player1, player2, winner, potAmount, betAmount } = gameResult;

    // Determine winner and update database
    let player1Result, player2Result;

    if (winner === 'player1') {
      player1Result = 'win';
      player2Result = 'loss';
    } else if (winner === 'player2') {
      player1Result = 'loss';
      player2Result = 'win';
    } else {
      player1Result = 'tie';
      player2Result = 'tie';
    }

    // Update user balances and stats
    const user1 = await User.findById(player1.userId);
    const user2 = player2.isBot ? null : await User.findById(player2.userId);

    if (user1) {
      await user1.updateGameStats(player1Result, betAmount);
    }

    if (user2) {
      await user2.updateGameStats(player2Result, betAmount);
    }

    // Save game to database
    try {
      await Game.create({
        gameId,
        player1: {
          userId: player1.userId,
          username: player1.username,
          cards: player1.cards,
          score: player1.score,
          socketId: player1Socket?.id
        },
        player2: {
          userId: player2.userId || 'bot',
          username: player2.username,
          cards: player2.cards,
          score: player2.score,
          socketId: player2Socket?.id,
          isBot: player2.isBot
        },
        betAmount,
        potAmount,
        winner,
        gameState: 'completed',
        completedAt: Date.now()
      });
    } catch (error) {
      console.error('Error saving game:', error);
    }

    // Emit results to players
    if (player1Socket) {
      player1Socket.emit('game_result', {
        gameId,
        playerCards: player1.cards,
        playerScore: player1.score,
        opponentCards: player2.cards,
        opponentScore: player2.score,
        winner: winner === 'player1' ? 'you' : winner === 'player2' ? 'opponent' : 'tie',
        result: player1Result,
        potAmount,
        betAmount,
        newBalance: user1.balance
      });
    }

    if (player2Socket) {
      player2Socket.emit('game_result', {
        gameId,
        playerCards: player2.cards,
        playerScore: player2.score,
        opponentCards: player1.cards,
        opponentScore: player1.score,
        winner: winner === 'player2' ? 'you' : winner === 'player1' ? 'opponent' : 'tie',
        result: player2Result,
        potAmount,
        betAmount,
        newBalance: user2?.balance
      });
    }
  }

  // Handle rematch request
  async handleRematchRequest(socket, data) {
    const { gameId } = data;
    const game = matchmaking.getGame(gameId);

    if (!game) {
      socket.emit('rematch_error', { message: 'Game not found' });
      return;
    }

    const result = matchmaking.handleRematchRequest(gameId, socket.id);

    if (result.rematch) {
      // Both players want rematch - start new game
      await this.startGame(game);
    } else {
      // Waiting for opponent
      socket.emit('rematch_pending', { message: result.message });
      
      // Notify opponent
      const opponentSocketId = game.player1.socketId === socket.id 
        ? game.player2.socketId 
        : game.player1.socketId;
      
      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId);
      if (opponentSocket) {
        opponentSocket.emit('rematch_request_received', {
          message: 'Opponent wants to play again'
        });
      }
    }
  }

  // Handle return to lobby
  async handleReturnToLobby(socket, data) {
    const { gameId } = data;
    matchmaking.endGame(gameId);
    socket.emit('lobby_ready', { message: 'Returned to lobby' });
  }

  // Handle disconnect
  async handleDisconnect(socket) {
    console.log(`🔌 User disconnected: ${socket.user.username} (${socket.id})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, { isOnline: false }).catch(console.error);

    // Handle active game
    const disconnectData = matchmaking.handleDisconnect(socket.id);

    if (disconnectData) {
      const { gameId, opponentSocketId } = disconnectData;
      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId);

      if (opponentSocket) {
        opponentSocket.emit('opponent_disconnected', {
          message: 'Opponent disconnected',
          gameId
        });
      }

      matchmaking.endGame(gameId);
    }
  }
}

module.exports = SocketHandler;
