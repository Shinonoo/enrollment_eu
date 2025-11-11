// Create floating particles
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particlesContainer.appendChild(particle);
}

// API base URL
const API_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// ✅ Add event listener to the form
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = event.target.querySelector('.login-btn');
    
    // Add loading state
    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Hide error message
            errorMessage.classList.remove('show');
            
            // Success animation
            loginBtn.textContent = 'Success!';
            loginBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // ✅ ROLE-BASED REDIRECT
            setTimeout(() => {
                switch(data.user.role) {
                    case 'admin':
                    case 'registrar_shs':
                    case 'registrar_jhs':
                        window.location.href = '/pages/registrar/dashboard.html';
                        break;
                    case 'accountant':
                        window.location.href = '/pages/accounting/dashboard.html';
                        break;
                    case 'cashier':
                        window.location.href = '/pages/cashier/dashboard.html';
                        break;
                    default:
                        window.location.href = '/';
                }
            }, 800);
        } else {
            // Show error
            errorMessage.textContent = '⚠️ ' + (data.message || data.error || 'Login failed');
            errorMessage.classList.add('show');
            loginBtn.textContent = 'Sign In';
            loginBtn.disabled = false;
            
            // Clear password
            document.getElementById('password').value = '';
            
            // Remove error after 4 seconds
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 4000);
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = '⚠️ Unable to connect to server. Please try again later.';
        errorMessage.classList.add('show');
        loginBtn.textContent = 'Sign In';
        loginBtn.disabled = false;
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 4000);
    }
});

// Check if already logged in with role-based redirect
if (localStorage.getItem('token')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
        switch(user.role) {
            case 'admin':
            case 'registrar_shs':
            case 'registrar_jhs':
                window.location.href = '/pages/registrar/dashboard.html';
                break;
            case 'accountant':
                window.location.href = '/pages/accounting/dashboard.html';
                break;
            case 'cashier':
                window.location.href = '/pages/cashier/dashboard.html';
                break;
            default:
                window.location.href = '/';
        }
    }
}

// Enter key navigation
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('password').focus();
    }
});

// Input focus animations
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.parentElement.style.transform = 'translateX(5px)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.parentElement.style.transform = 'translateX(0)';
    });
});
