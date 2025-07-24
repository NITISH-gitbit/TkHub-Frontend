// API Base URL
const API_BASE = 'https://tinkerhub-api.azurewebsites.net';

// Helper to show/hide forms
function showForm(formId) {
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    document.getElementById('verify-message').style.display = 'none';
    document.getElementById(formId).style.display = 'flex';
}

// Switch form links
if (document.getElementById('show-signup')) {
    document.getElementById('show-signup').onclick = e => { e.preventDefault(); showForm('signup-form'); };
}
if (document.getElementById('show-login')) {
    document.getElementById('show-login').onclick = e => { e.preventDefault(); showForm('login-form'); };
}
if (document.getElementById('show-login2')) {
    document.getElementById('show-login2').onclick = e => { e.preventDefault(); showForm('login-form'); };
}
if (document.getElementById('show-forgot')) {
    document.getElementById('show-forgot').onclick = e => { e.preventDefault(); showForm('forgot-form'); };
}

// Signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.onsubmit = async e => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const msg = document.getElementById('signup-message');
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        
        // Clear previous message and disable button
        msg.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                signupForm.reset();
                showForm('login-form');
                const verifyMsg = document.getElementById('verify-message');
                verifyMsg.textContent = data.message;
                verifyMsg.className = 'message success';
                verifyMsg.style.display = 'block';
            } else {
                msg.textContent = data.message || 'Signup failed. Please try again.';
                msg.className = 'message';
            }
        } catch (error) {
            console.error('Signup error:', error);
            msg.textContent = 'Network error. Please check your connection and try again.';
            msg.className = 'message';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    };
}

// Add resend verification button logic
function addResendVerificationButton(msgElem, email) {
    // Remove existing button if any
    let existingBtn = document.getElementById('resend-verification-btn');
    if (existingBtn) existingBtn.remove();
    const btn = document.createElement('button');
    btn.id = 'resend-verification-btn';
    btn.textContent = 'Resend Verification Email';
    btn.style.marginLeft = '10px';
    btn.onclick = async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = 'Resending...';
        try {
            const res = await fetch(`${API_BASE}/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                msgElem.textContent = data.message;
                msgElem.className = 'message success';
            } else {
                msgElem.textContent = data.message || 'Failed to resend verification email.';
                msgElem.className = 'message';
            }
        } catch {
            msgElem.textContent = 'Network error.';
            msgElem.className = 'message';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Resend Verification Email';
        }
    };
    msgElem.appendChild(btn);
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = async e => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;
        const msg = document.getElementById('login-message');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        msg.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        // Remove any existing resend button
        let existingBtn = document.getElementById('resend-verification-btn');
        if (existingBtn) existingBtn.remove();
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = data.message;
                msg.className = 'message success';
                loginForm.reset();
            } else if (res.status === 403 && data.message && data.message.toLowerCase().includes('verify')) {
                msg.textContent = 'Please verify your account before logging in. Check your email for the verification link.';
                msg.className = 'message';
                // Add resend verification button
                addResendVerificationButton(msg, identifier.includes('@') ? identifier : '');
            } else {
                msg.textContent = data.message || 'Login failed. Please try again.';
                msg.className = 'message';
            }
        } catch (error) {
            console.error('Login error:', error);
            msg.textContent = 'Network error. Please check your connection and try again.';
            msg.className = 'message';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    };
}

// Forgot Password
const forgotForm = document.getElementById('forgot-form');
if (forgotForm) {
    forgotForm.onsubmit = async e => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const msg = document.getElementById('forgot-message');
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        
        msg.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Reset Link...';
        
        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                msg.textContent = data.message;
                msg.className = 'message success';
                forgotForm.reset();
            } else {
                msg.textContent = data.message || 'Request failed. Please try again.';
                msg.className = 'message';
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            msg.textContent = 'Network error. Please check your connection and try again.';
            msg.className = 'message';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    };
}

// Email verification handler
function handleEmailVerification() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (params.has('verify-email') && token) {
        fetch(`${API_BASE}/verify-email?token=${token}`)
            .then(res => res.text())
            .then(msg => {
                showForm('login-form');
                const verifyMsg = document.getElementById('verify-message');
                verifyMsg.textContent = msg;
                verifyMsg.className = 'message success';
                verifyMsg.style.display = 'block';
            })
            .catch(error => {
                console.error('Verification error:', error);
                showForm('login-form');
                const verifyMsg = document.getElementById('verify-message');
                verifyMsg.textContent = 'Verification failed. Please try again or contact support.';
                verifyMsg.className = 'message';
                verifyMsg.style.display = 'block';
            });
    }
}

// Initialize email verification handler
handleEmailVerification(); 

// Reset Password (migrated from reset.html)
const resetForm = document.getElementById('reset-form');
if (resetForm) {
    function getTokenFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    }
    // Show reset form if token is present in URL
    if (getTokenFromURL()) {
        document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
        resetForm.style.display = 'flex';
    }
    resetForm.onsubmit = async e => {
        e.preventDefault();
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-password-confirm').value;
        const token = getTokenFromURL();
        const msg = document.getElementById('reset-message');
        msg.textContent = '';
        if (!token) {
            msg.textContent = 'Invalid or missing token.';
            msg.className = 'message';
            return;
        }
        if (newPassword !== confirmPassword) {
            msg.textContent = 'Passwords do not match.';
            msg.className = 'message';
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = data.message + ' You can now ';
                const loginLink = document.createElement('a');
                loginLink.href = 'index.html';
                loginLink.textContent = 'log in';
                msg.appendChild(loginLink);
                msg.className = 'message success';
                resetForm.reset();
            } else {
                msg.textContent = data.message || 'Reset failed.';
                msg.className = 'message';
            }
        } catch {
            msg.textContent = 'Network error.';
            msg.className = 'message';
        }
    };
} 