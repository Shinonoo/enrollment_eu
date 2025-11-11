const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
const ctxStatus = document.getElementById('paymentsByStatusChart').getContext('2d');
const paymentsByStatusChart = new Chart(ctxStatus, {
  type: 'doughnut',
  data: {
    labels: ['Pending', 'Partial', 'Fully Paid'],
    datasets: [{
      data: [10, 15, 75],
      backgroundColor: [
        '#8B000040', // Semi-transparent maroon (pending)
        '#B2222200', // Darker maroon transparent (partial)
        '#6B0000DD'  // Strong maroon (fully paid)
      ],
      borderColor: ['#8B0000', '#A52A2A', '#6B0000'],
      borderWidth: 1
    }]
  },
  options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});

const monthlyCollectionChart = new Chart(ctxMonthly, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Amount Collected',
      data: [15000, 22000, 18000, 24000, 27000, 30000, 26000, 32000],
      borderColor: '#6B0000',
      backgroundColor: 'rgba(139, 0, 0, 0.15)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: '#8B0000'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { color: '#6B0000' } },
              x: { ticks: { color: '#6B0000' } }
            }
  }
});

if (!token) {
    window.location.href = '/pages/public/login.html';
}

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/payments/statistics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            const stats = data.statistics;
            
            // Animate numbers
            animateValue('pendingCount', 0, stats.pending || 0, 1000);
            animateValue('partialCount', 0, stats.partial || 0, 1000);
            animateValue('paidCount', 0, stats.paid || 0, 1000);
            
            const totalCollected = stats.total_collected || 0;
            document.getElementById('totalCollected').textContent = 
                totalCollected.toLocaleString('en-PH', { minimumFractionDigits: 2 });
        }
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
    }
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/pages/public/login.html';
    }
}

loadStatistics();
