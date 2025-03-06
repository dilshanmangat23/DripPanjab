// Account Management Utilities
const authManager = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get current user email
    getCurrentUser() {
        return localStorage.getItem('userEmail') || 'Guest';
    },

    // Login method with enhanced validation
    login(email, password) {
        // Basic validation (replace with proper authentication)
        const validUsers = [
            { 
                email: 'jaspreet.singh@example.com', 
                password: 'password123',
                name: 'Jaspreet Singh'
            }
        ];

        const user = validUsers.find(u => u.email === email && u.password === password);

        if (user) {
            // Store user details
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', user.name);
            
            // Redirect to account page on successful login
            window.location.href = 'account.html';
            return true;
        }
        return false;
    },

    // Logout method
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    },

    // Check and manage page access
    checkAuth() {
        // If not logged in, redirect to login page
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    // Update user information on account pages
    updateUserInfo() {
        const userName = localStorage.getItem('userName') || 'User';
        const userEmail = this.getCurrentUser();
        
        // Update user name
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = userName;
        });

        // Update user email
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = userEmail;
        });
    }
};

// Attach to window for global access
window.authManager = authManager;

// Add event listeners for logout links and page-specific scripts
document.addEventListener('DOMContentLoaded', function() {
    // Logout links
    const logoutLinks = document.querySelectorAll('.logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            authManager.logout();
        });
    });

    // Check authentication for protected pages
    if (document.querySelector('.account-section')) {
        authManager.checkAuth();
        authManager.updateUserInfo();
    }

    // Login page specific script
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginError = document.getElementById('loginError');

            const loginSuccess = authManager.login(email, password);

            if (!loginSuccess) {
                loginError.style.display = 'block';
            }
        });

        // Redirect logged-in users away from login page
        if (authManager.isLoggedIn()) {
            window.location.href = 'account.html';
        }
    }
});