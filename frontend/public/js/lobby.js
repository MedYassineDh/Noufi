// Lobby Module

class LobbyManager {
    constructor() {
        this.selectedBet = null;
        this.inQueue = false;
        this.queueTimer = null;
        this.queueTimeRemaining = CONFIG.MATCHMAKING_TIMEOUT / 1000;
        this.initializeEventListeners();
        this.createParticles();
    }

    initializeEventListeners() {
        // Bet selection
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectBet(parseInt(btn.dataset.amount));
            });
        });

        // Play button
        document.getElementById('play-btn')?.addEventListener('click', () => {
            this.joinQueue();
        });

        // Cancel queue
        document.getElementById('cancel-queue')?.addEventListener('click', () => {
            this.leaveQueue();
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            authManager.logout();
        });
    }

    updateUserInfo(user) {
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-balance').textContent = `$${user.balance}`;
        
        const winRate = user.totalGamesPlayed > 0 
            ? ((user.wins / user.totalGamesPlayed) * 100).toFixed(1)
            : '0.0';
        document.getElementById('win-rate').textContent = `Win Rate: ${winRate}%`;
    }

    selectBet(amount) {
        // Check if user has sufficient balance
        const user = authManager.getUser();
        if (user.balance < amount) {
            alert('Insufficient balance for this bet amount!');
            return;
        }

        this.selectedBet = amount;

        // Update UI
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const selectedBtn = document.querySelector(`[data-amount="${amount}"]`);
        selectedBtn.classList.add('selected');

        // Enable play button
        const playBtn = document.getElementById('play-btn');
        playBtn.disabled = false;
        playBtn.querySelector('span').textContent = `Play for $${amount}`;
    }

    joinQueue() {
        if (!this.selectedBet) return;

        this.inQueue = true;
        
        // Hide bet options and play button
        document.querySelector('.bet-options').style.display = 'none';
        document.getElementById('play-btn').style.display = 'none';

        // Show queue status
        const queueStatus = document.getElementById('queue-status');
        queueStatus.style.display = 'block';

        // Emit join queue event to server
        if (window.gameManager && window.gameManager.socket) {
            window.gameManager.socket.emit('join_queue', {
                betAmount: this.selectedBet
            });
        }

        // Start countdown timer
        this.startQueueTimer();
    }

    leaveQueue() {
        this.inQueue = false;
        
        // Stop timer
        if (this.queueTimer) {
            clearInterval(this.queueTimer);
            this.queueTimer = null;
        }

        // Reset timer display
        this.queueTimeRemaining = CONFIG.MATCHMAKING_TIMEOUT / 1000;

        // Hide queue status
        document.getElementById('queue-status').style.display = 'none';

        // Show bet options and play button
        document.querySelector('.bet-options').style.display = 'flex';
        document.getElementById('play-btn').style.display = 'block';

        // Emit leave queue event to server
        if (window.gameManager && window.gameManager.socket) {
            window.gameManager.socket.emit('leave_queue');
        }
    }

    startQueueTimer() {
        this.queueTimeRemaining = CONFIG.MATCHMAKING_TIMEOUT / 1000;
        
        this.queueTimer = setInterval(() => {
            this.queueTimeRemaining--;
            
            document.getElementById('queue-timer').textContent = `${this.queueTimeRemaining}s`;

            if (this.queueTimeRemaining <= 0) {
                clearInterval(this.queueTimer);
            }
        }, 1000);
    }

    onMatchFound(matchData) {
        // Stop queue timer
        if (this.queueTimer) {
            clearInterval(this.queueTimer);
            this.queueTimer = null;
        }

        // Transition to game screen
        setTimeout(() => {
            document.getElementById('lobby-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');

            if (window.gameManager) {
                window.gameManager.startGame(matchData);
            }
        }, 1000);
    }

    resetLobby() {
        this.selectedBet = null;
        this.inQueue = false;

        // Reset UI
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const playBtn = document.getElementById('play-btn');
        playBtn.disabled = true;
        playBtn.querySelector('span').textContent = 'Select Bet Amount';

        document.getElementById('queue-status').style.display = 'none';
        document.querySelector('.bet-options').style.display = 'flex';
        document.getElementById('play-btn').style.display = 'block';
    }

    createParticles() {
        const container = document.getElementById('particles-auth');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${5 + Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }
}

// Initialize lobby manager
const lobbyManager = new LobbyManager();
window.lobbyManager = lobbyManager;
