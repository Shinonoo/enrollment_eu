// DASHBOARD PAGE LOGIC
const token = localStorage.getItem('token');
let currentSlide = 0;
let autoplayInterval;
let isTransitioning = false;

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing carousel...');
    
    const wrapper = document.getElementById('carouselWrapper');
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    
    console.log('Found slides:', slides.length);
    console.log('Wrapper:', wrapper);
    console.log('Dots container:', dotsContainer);
    
    if (!wrapper || slides.length === 0) {
        console.error('Carousel elements not found!');
        return;
    }
    
    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => {
                currentSlide = i;
                updateCarousel();
                resetAutoplay();
            };
            dotsContainer.appendChild(dot);
        }
    }
    
    // Update carousel display
    updateCarousel();
    
    // Start autoplay
    startAutoplay();
    
    // Add hover pause
    wrapper.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });
    
    wrapper.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Load stats
    loadDashboardStats();
});

// Update carousel position
function updateCarousel() {
    const wrapper = document.getElementById('carouselWrapper');
    if (!wrapper) return;
    
    const offset = currentSlide * -100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    console.log('Showing slide:', currentSlide);
}

// Next slide
function nextSlide() {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
    console.log('Next slide:', currentSlide);
}

// Previous slide
function prevSlide() {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
    console.log('Prev slide:', currentSlide);
}

// Autoplay
function startAutoplay() {
    autoplayInterval = setInterval(() => {
        nextSlide();
    }, 6000);
}

// Reset autoplay
function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

// Load statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('http://localhost:3000/api/admission/statistics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        
        if (data.success && data.statistics) {
            document.getElementById('totalApps').textContent = data.statistics.total || 0;
            document.getElementById('pending').textContent = data.statistics.pending || 0;
            document.getElementById('approved').textContent = data.statistics.approved || 0;
            document.getElementById('rejected').textContent = data.statistics.rejected || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}
