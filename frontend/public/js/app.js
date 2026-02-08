// Main App Initialization

class NoufiApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎰 Noufi Game Initializing...');

        // Check if user is already authenticated
        if (authManager.isAuthenticated()) {
            this.autoLogin();
        } else {
            this.showAuthScreen();
        }

        // Add global error handler
        this.setupErrorHandling();

        // Add page visibility handler
        this.setupVisibilityHandling();

        console.log('✅ Noufi Game Ready!');
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('lobby-screen').classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
    }

    async autoLogin() {
        try {
            // Verify token is still valid
            const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.ME}`, {
                headers: {
                    'Authorization': `Bearer ${authManager.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update user data
                authManager.updateUser(data.user);
                
                // Show lobby
                document.getElementById('auth-screen').classList.remove('active');
                document.getElementById('lobby-screen').classList.add('active');

                // Update lobby info
                lobbyManager.updateUserInfo(data.user);

                // Connect to game server
                gameManager.connect(authManager.getToken());

                console.log('✅ Auto-login successful');
            } else {
                // Token expired or invalid
                this.handleAuthFailure();
            }
        } catch (error) {
            console.error('Auto-login error:', error);
            this.handleAuthFailure();
        }
    }

    handleAuthFailure() {
        // Clear auth data
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        
        // Show auth screen
        this.showAuthScreen();
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    setupVisibilityHandling() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden');
                
                // Pause music if playing
                if (audioManager && audioManager.musicPlaying) {
                    audioManager.pauseMusic();
                }
            } else {
                console.log('Page visible');
                
                // Optionally resume music
                // audioManager.playMusic();
            }
        });

        // Handle beforeunload (user leaving page)
        window.addEventListener('beforeunload', (e) => {
            // If in active game, warn user
            if (gameManager && gameManager.currentGame) {
                e.preventDefault();
                e.returnValue = 'You have an active game. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // Utility functions
    static formatMoney(amount) {
        return `$${amount.toLocaleString()}`;
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    static formatTime(date) {
        return new Date(date).toLocaleTimeString();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NoufiApp();
    });
} else {
    new NoufiApp();
}

// Export utilities
window.NoufiApp = NoufiApp;
