class AuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.initializeAuth();
    }

    initializeAuth() {
        // Login form handling
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form handling
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Social login buttons
        const googleBtn = document.querySelector('.social-button.google');
        const facebookBtn = document.querySelector('.social-button.facebook');

        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.handleFacebookSignIn());
        }

        // Check auth state
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.handleAuthStateChange(user);
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value;

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({
                displayName: fullName
            });
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleGoogleSignIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await this.auth.signInWithPopup(provider);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleFacebookSignIn() {
        const provider = new firebase.auth.FacebookAuthProvider();
        try {
            await this.auth.signInWithPopup(provider);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleAuthStateChange(user) {
        // Update UI based on auth state
        const authButtons = document.querySelectorAll('.auth-button');
        if (authButtons) {
            authButtons.forEach(button => {
                button.style.display = user ? 'none' : 'block';
            });
        }

        // Update user profile if available
        const userProfile = document.querySelector('.user-profile');
        if (userProfile && user) {
            userProfile.innerHTML = `
                <img src="${user.photoURL || 'images/default-avatar.png'}" alt="Profile" class="profile-image">
                <span>${user.displayName || user.email}</span>
            `;
        }
    }

    showError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.querySelector('.auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error';
            document.querySelector('.auth-form').prepend(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    async signOut() {
        try {
            await this.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            this.showError(error.message);
        }
    }
}

// Initialize authentication
const authManager = new AuthManager(); 