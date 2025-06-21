// auth-header.js - Authentication header handler

class AuthHeaderManager {
    constructor() {
        this.token = null;
        this.userInfo = null;
        this.init();
    }

    init() {
        // Check if token exists in localStorage
        this.token = localStorage.getItem('token');

        if (this.token) {
            this.verifyTokenAndLoadHeader();
        } else {
            this.loadGuestHeader();
        }
    }

    async verifyTokenAndLoadHeader() {
        try {
            const response = await fetch('/api/auth/getUser', {
                method: 'GET',
                headers: {
                    'Authorization': this.token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.userInfo = await response.json();
                this.loadAuthenticatedHeader();
            } else {
                // Token is invalid, remove it and show guest header
                this.handleInvalidToken();
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            this.handleInvalidToken();
        }
    }

    handleInvalidToken() {
        // Remove invalid token from localStorage
        localStorage.removeItem('token');
        this.token = null;
        this.userInfo = null;
        this.loadGuestHeader();
    }

    loadGuestHeader() {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="../login.html" class="btn btn-secondary" id="loginBtn">
                    <img src="../images/log-in.svg" alt="Log in" class="icon">
                    Login
                </a>
                <a href="../register.html" class="btn btn-primary" id="signupBtn">
                    <img src="../images/user-plus.svg" alt="Sign up" class="icon">
                    Sign Up
                </a>
            `;
        }
    }

    loadAuthenticatedHeader() {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            // Create profile button with user info
            const userDisplayName = this.userInfo.name || this.userInfo.email || 'User';

            authButtons.innerHTML = `
                    <button class="btn btn-secondary logout-btn" id="logoutBtn">
                        <img src="../images/log-out.svg" alt="Logout" class="icon">
                        Logout
                    </button>
                    <button class="btn btn-primary profile-btn" id="profileBtn">
                        <img src="../images/user.svg" alt="Profile" class="icon">
                        Profile
                    </button>
            `;

            // Add event listeners
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        const profileBtn = document.getElementById('profileBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.handleProfileClick();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    handleProfileClick() {
        // Navigate to profile page or show profile dropdown
        window.location.href = 'profile.html';
    }

    handleLogout() {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Clear user data
        this.token = null;
        this.userInfo = null;

        // Redirect to index.html
        window.location.href = 'index.html';
    }

    // Public method to refresh header (useful after login)
    refreshHeader() {
        this.init();
    }
}