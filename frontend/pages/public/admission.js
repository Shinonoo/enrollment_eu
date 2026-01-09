// ===== ADMISSION SELECTOR JAVASCRIPT =====

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeSelector();
});

// Initialize the selector page
function initializeSelector() {
    addCardClickEffects();
    addAccessibility();
    trackCardClicks();
}

// Add visual feedback on card interactions
function addCardClickEffects() {
    const cards = document.querySelectorAll('.applicant-card');
    
    cards.forEach(card => {
        // Add ripple effect on click
        card.addEventListener('click', function(e) {
            createRipple(e, this);
        });

        // Add focus outline for keyboard navigation
        card.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--gold-primary)';
        });

        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// Create ripple effect on card click
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');

    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add accessibility features
function addAccessibility() {
    const cards = document.querySelectorAll('.applicant-card');
    
    cards.forEach((card, index) => {
        // Make cards keyboard accessible
        card.setAttribute('tabindex', '0');
        
        // Add ARIA labels
        const cardTitle = card.querySelector('.card-title').textContent;
        card.setAttribute('aria-label', `Select ${cardTitle} application`);
        
        // Allow Enter key to activate
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Track which card was clicked (for analytics)
function trackCardClicks() {
    const cards = document.querySelectorAll('.applicant-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const cardType = this.querySelector('.card-title').textContent;
            console.log(`User selected: ${cardType}`);
            
            // Store selection in sessionStorage for later use
            sessionStorage.setItem('applicationType', cardType);
            sessionStorage.setItem('applicationStartTime', new Date().toISOString());
            
            // Optional: Send analytics event
            // trackAnalytics('application_type_selected', { type: cardType });
        });
    });
}

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .applicant-card {
        position: relative;
        overflow: hidden;
    }

    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 215, 0, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
