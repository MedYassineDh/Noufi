// Noufi Game Configuration

const CONFIG = {
    // API Endpoints
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.origin,
    
    // Socket.io
    SOCKET_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : window.location.origin,
    
    // Game Settings
    BET_AMOUNTS: [10, 50, 100, 500, 1000],
    MATCHMAKING_TIMEOUT: 20000, // 20 seconds
    CARD_REVEAL_DELAY: 1000, // 1 second per card
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'noufi_token',
        USER: 'noufi_user'
    },
    
    // API Endpoints
    ENDPOINTS: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        ME: '/api/auth/me',
        LOGOUT: '/api/auth/logout'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
