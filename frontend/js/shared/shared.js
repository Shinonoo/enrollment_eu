// Simple setup
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/pages/public/login.html';
});

function logout() {
    // Clear the token
    localStorage.removeItem('token');
    
    // Optional: Clear any other stored data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    window.location.href = '/pages/public/login.html';
}
