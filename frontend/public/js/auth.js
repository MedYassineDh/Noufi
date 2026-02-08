// Authentication Module

class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        this.user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || 'null');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form switching
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Form submissions
        document.getElementById('login-btn')?.addEventListener('click', () => {
            this.handleLogin();
        });

        document.getElementById('register-btn')?.addEventListener('click', () => {
            this.handleRegister();
        });

        // Enter key submissions
        document.getElementById('login-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('register-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });
    }

    switchToRegister() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.add('active');
        this.clearErrors();
    }

    switchToLogin() {
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
        this.clearErrors();
    }

    clearErrors() {
        document.getElementById('login-error').classList.remove('show');
        document.getElementById('register-error').classList.remove('show');
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showError('login-error', 'Please enter username and password');
            return;
        }

        const btn = document.getElementById('login-btn');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Entering...';

        try {
            const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, this.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));

            // Transition to lobby
            this.onLoginSuccess();

        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', error.message);
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Enter Game';
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            this.showError('register-error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('register-error', 'Password must be at least 6 characters');
            return;
        }

        const btn = document.getElementById('register-btn');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Creating...';

        try {
            const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token and user data
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, this.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));

            // Transition to lobby
            this.onLoginSuccess();

        } catch (error) {
            console.error('Registration error:', error);
            this.showError('register-error', error.message);
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Create Account';
        }
    }

    onLoginSuccess() {
        // Hide auth screen, show lobby
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('lobby-screen').classList.add('active');

        // Initialize lobby with user data
        if (window.lobbyManager) {
            window.lobbyManager.updateUserInfo(this.user);
        }

        // Connect to game socket
        if (window.gameManager) {
            window.gameManager.connect(this.token);
        }
    }

    async logout() {
        try {
            await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.LOGOUT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear local storage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        this.token = null;
        this.user = null;

        // Disconnect socket
        if (window.gameManager && window.gameManager.socket) {
            window.gameManager.socket.disconnect();
        }

        // Return to auth screen
        document.getElementById('lobby-screen').classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));
    }
}

// Initialize auth manager
const authManager = new AuthManager();
