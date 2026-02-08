// Game Module

class GameManager {
    constructor() {
        this.socket = null;
        this.currentGame = null;
        this.playerCards = [];
        this.opponentCards = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Rematch button
        document.getElementById('rematch-btn')?.addEventListener('click', () => {
            this.requestRematch();
        });

        // Change bet / return to lobby
        document.getElementById('change-bet-btn')?.addEventListener('click', () => {
            this.returnToLobby();
        });
    }

    connect(token) {
        this.socket = io(CONFIG.SOCKET_URL, {
            auth: { token }
        });

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to game server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from game server');
        });

        // Queue events
        this.socket.on('queue_joined', (data) => {
            console.log('Joined queue:', data);
        });

        this.socket.on('queue_left', (data) => {
            console.log('Left queue:', data);
        });

        this.socket.on('queue_error', (data) => {
            alert(data.message);
            if (window.lobbyManager) {
                window.lobbyManager.leaveQueue();
            }
        });

        // Match events
        this.socket.on('match_found', (matchData) => {
            console.log('Match found:', matchData);
            if (window.lobbyManager) {
                window.lobbyManager.onMatchFound(matchData);
            }
        });

        this.socket.on('matched_with_bot', (data) => {
            console.log('Matched with bot:', data);
        });

        // Game events
        this.socket.on('game_dealing', (data) => {
            this.onGameDealing(data);
        });

        this.socket.on('card_reveal', (data) => {
            this.onCardReveal(data);
        });

        this.socket.on('game_result', (data) => {
            this.onGameResult(data);
        });

        // Rematch events
        this.socket.on('rematch_pending', (data) => {
            this.showStatus('Waiting for opponent...');
        });

        this.socket.on('rematch_request_received', (data) => {
            this.showStatus(data.message);
        });

        // Disconnect events
        this.socket.on('opponent_disconnected', (data) => {
            alert('Opponent disconnected!');
            this.returnToLobby();
        });
    }

    startGame(matchData) {
        this.currentGame = matchData;
        
        // Update UI
        document.getElementById('opponent-name').textContent = matchData.opponent;
        document.getElementById('player-name-game').textContent = authManager.getUser().username;
        document.getElementById('player-balance-game').textContent = `$${authManager.getUser().balance}`;
        document.getElementById('pot-amount').textContent = `$${matchData.potAmount}`;

        // Show status
        this.showStatus('Game starting...');

        // Hide game actions
        document.getElementById('game-actions').style.display = 'none';
    }

    onGameDealing(data) {
        this.showStatus('Dealer is shuffling cards...');
        
        // Clear previous cards
        this.playerCards = [];
        this.opponentCards = [];
        document.getElementById('player-cards-display').innerHTML = '';
        document.getElementById('opponent-cards-display').innerHTML = '';
        document.getElementById('player-score').textContent = '';
        document.getElementById('opponent-score').textContent = '';
    }

    onCardReveal(data) {
        const { step, playerCard, opponentCard } = data;

        // Add cards with animation
        this.addCard('player', playerCard, step);
        this.addCard('opponent', opponentCard, step);

        this.showStatus(`Revealing cards... (${step}/3)`);
    }

    addCard(player, cardValue, step) {
        const container = player === 'player' 
            ? document.getElementById('player-cards-display')
            : document.getElementById('opponent-cards-display');

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-front">${this.getCardDisplay(cardValue)}</div>
            <div class="card-back"></div>
        `;

        // Add with delay for animation
        setTimeout(() => {
            container.appendChild(card);
            
            // Flip card after brief delay
            setTimeout(() => {
                card.classList.add('flipped');
                if (window.audioManager) {
                    window.audioManager.playSound('cardFlip');
                }
            }, 300);
        }, 100 * step);

        // Store card
        if (player === 'player') {
            this.playerCards.push(cardValue);
        } else {
            this.opponentCards.push(cardValue);
        }
    }

    getCardDisplay(cardValue) {
        // Card value format: "A♠", "10♥", "K♦", etc.
        const rank = cardValue.slice(0, -1);
        const suit = cardValue.slice(-1);
        
        // Color based on suit
        const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
        
        return `<span style="color: ${color}">${cardValue}</span>`;
    }

    onGameResult(data) {
        console.log('Game result:', data);

        const { 
            playerCards, 
            playerScore, 
            opponentCards, 
            opponentScore, 
            winner, 
            result, 
            potAmount,
            newBalance 
        } = data;

        // Update scores
        setTimeout(() => {
            document.getElementById('player-score').textContent = `Score: ${playerScore}`;
            document.getElementById('opponent-score').textContent = `Score: ${opponentScore}`;
            
            if (window.audioManager) {
                window.audioManager.playSound('cardFlip');
            }
        }, 1500);

        // Show winner after scores
        setTimeout(() => {
            this.showWinner(winner, result, potAmount, newBalance);
        }, 3000);
    }

    showWinner(winner, result, potAmount, newBalance) {
        const overlay = document.getElementById('winner-overlay');
        const winnerText = document.getElementById('winner-text');
        const winnerAmount = document.getElementById('winner-amount');

        // Update user balance
        authManager.updateUser({ balance: newBalance });
        document.getElementById('user-balance').textContent = `$${newBalance}`;
        document.getElementById('player-balance-game').textContent = `$${newBalance}`;

        // Determine winner text
        if (winner === 'you') {
            winnerText.textContent = 'YOU WIN!';
            winnerText.style.color = '#D4AF37';
            winnerAmount.textContent = `+$${potAmount / 2}`;
            
            // Play win sound
            if (window.audioManager) {
                window.audioManager.playSound('win');
            }
            
            // Show confetti
            this.createConfetti();
        } else if (winner === 'opponent') {
            winnerText.textContent = 'YOU LOSE';
            winnerText.style.color = '#ff6b6b';
            winnerAmount.textContent = `-$${potAmount / 2}`;
            
            // Play lose sound
            if (window.audioManager) {
                window.audioManager.playSound('lose');
            }
        } else {
            winnerText.textContent = 'TIE';
            winnerText.style.color = '#F4E4A6';
            winnerAmount.textContent = `$0`;
        }

        // Show overlay
        overlay.classList.add('show');

        // Hide status
        document.getElementById('game-status').style.display = 'none';

        // Show game actions after delay
        setTimeout(() => {
            overlay.classList.remove('show');
            document.getElementById('game-actions').style.display = 'flex';
        }, 4000);
    }

    createConfetti() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = ['#D4AF37', '#F4E4A6', '#8B0000', '#FAF8F3'][Math.floor(Math.random() * 4)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }

    requestRematch() {
        if (!this.currentGame) return;

        this.socket.emit('rematch_request', {
            gameId: this.currentGame.gameId
        });

        this.showStatus('Rematch requested...');
        document.getElementById('game-actions').style.display = 'none';
    }

    returnToLobby() {
        if (this.currentGame) {
            this.socket.emit('return_to_lobby', {
                gameId: this.currentGame.gameId
            });
        }

        // Clear game state
        this.currentGame = null;
        this.playerCards = [];
        this.opponentCards = [];

        // Reset lobby
        if (window.lobbyManager) {
            window.lobbyManager.resetLobby();
        }

        // Transition to lobby
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('lobby-screen').classList.add('active');
    }

    showStatus(message) {
        const statusElement = document.getElementById('status-text');
        statusElement.textContent = message;
        document.getElementById('game-status').style.display = 'block';
    }

    hideStatus() {
        document.getElementById('game-status').style.display = 'none';
    }
}

// Initialize game manager
const gameManager = new GameManager();
window.gameManager = gameManager;
