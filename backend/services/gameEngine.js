const crypto = require('crypto');

class GameEngine {
  constructor() {
    this.suits = ['♠', '♥', '♦', '♣'];
    this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  }

  // Create a shuffled deck
  createDeck() {
    const deck = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push(`${rank}${suit}`);
      }
    }
    return this.shuffleDeck(deck);
  }

  // Fisher-Yates shuffle with crypto-secure randomness
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Use crypto.randomInt for secure random number generation
      const j = crypto.randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Deal 3 cards to a player
  dealCards(deck, count = 3) {
    return deck.splice(0, count);
  }

  // Calculate card value according to Noufi rules
  getCardValue(card) {
    const rank = card.slice(0, -1); // Remove suit symbol
    
    // 10, J, Q, K = 0 in ones digit
    if (['10', 'J', 'Q', 'K'].includes(rank)) {
      return 0;
    }
    
    // Ace = 1
    if (rank === 'A') {
      return 1;
    }
    
    // Number cards = face value
    return parseInt(rank);
  }

  // Calculate hand score (sum of cards, ones digit only)
  calculateScore(cards) {
    const sum = cards.reduce((total, card) => {
      return total + this.getCardValue(card);
    }, 0);
    
    // Return ones digit only (13 → 3, 25 → 5, 30 → 0)
    return sum % 10;
  }

  // Determine winner
  determineWinner(player1Score, player2Score) {
    if (player1Score > player2Score) {
      return 'player1';
    } else if (player2Score > player1Score) {
      return 'player2';
    } else {
      return 'tie';
    }
  }

  // Play a complete game
  playGame(player1Data, player2Data, betAmount, isBot = false, botWinRate = 0.65) {
    const deck = this.createDeck();
    
    // Deal cards
    const player1Cards = this.dealCards(deck, 3);
    const player2Cards = this.dealCards(deck, 3);
    
    // Calculate scores
    let player1Score = this.calculateScore(player1Cards);
    let player2Score = this.calculateScore(player2Cards);
    
    // If playing against bot, adjust outcome based on bot win rate
    if (isBot) {
      const random = Math.random();
      
      if (random < botWinRate) {
        // Bot should win - if it's not already winning, manipulate the score
        if (player1Score >= player2Score) {
          // Ensure bot wins by giving it a higher score
          player2Score = (player1Score + 1) % 10;
          if (player2Score === 0 && player1Score === 9) {
            player2Score = 9;
            player1Score = 8;
          }
        }
      } else {
        // Player should win
        if (player2Score >= player1Score) {
          player1Score = (player2Score + 1) % 10;
          if (player1Score === 0 && player2Score === 9) {
            player1Score = 9;
            player2Score = 8;
          }
        }
      }
    }
    
    // Determine winner
    const winner = this.determineWinner(player1Score, player2Score);
    
    // Calculate pot
    const potAmount = betAmount * 2;
    
    return {
      player1: {
        cards: player1Cards,
        score: player1Score,
        ...player1Data
      },
      player2: {
        cards: player2Cards,
        score: player2Score,
        ...player2Data
      },
      winner,
      potAmount,
      betAmount
    };
  }

  // Simulate card reveal sequence for suspense
  createRevealSequence(player1Cards, player2Cards) {
    const sequence = [];
    
    for (let i = 0; i < 3; i++) {
      sequence.push({
        step: i + 1,
        player1Card: player1Cards[i],
        player2Card: player2Cards[i],
        delay: 1000 // 1 second between reveals
      });
    }
    
    return sequence;
  }

  // Get game statistics
  getGameStats(cards) {
    return {
      cards,
      score: this.calculateScore(cards),
      cardValues: cards.map(card => ({
        card,
        value: this.getCardValue(card)
      }))
    };
  }
}

module.exports = new GameEngine();
