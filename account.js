// Account Management Utilities
const AccountManager = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get current user email
    getCurrentUser() {
        return localStorage.getItem('userEmail') || 'Guest';
    },

    // Login method
    login(email, password) {
        // Simple validation (replace with proper authentication)
        if (email && password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            return true;
        }
        return false;
    },

    // Logout method
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
};

// Export for use in other scripts
window.AccountManager = AccountManager;