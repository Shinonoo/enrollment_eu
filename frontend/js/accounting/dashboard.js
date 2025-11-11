// ============================================
// Configuration & State
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:3000/api',
    REFRESH_INTERVAL: 60000, // 60 seconds
    TOAST_DURATION: 3000
};

const STATE = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    statistics: {},
    recentTransactions: [],
    refreshTimer: null
};

if (!STATE.token) {
    window.location.href = '/pages/public/login.html';
}

// ============================================
// Utility Functions
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span>${icons[type]}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateLastUpdated() {
    document.getElementById('lastUpdate').textContent = 'just now';
}

function navigateTo(url) {
    window.location.href = url;
}

// ============================================
// API Calls
// ============================================

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${STATE.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// Data Loading
// ============================================

async function loadStatistics() {
    try {
        const data = await fetchAPI('/payments/statistics');
        STATE.statistics = data.statistics || {};
        updateStatisticsDisplay();
        updateLastUpdated();
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

async function loadRecentTransactions() {
    try {
        const data = await fetchAPI('/payments/applications?limit=5&sort=-created_at');
        STATE.recentTransactions = data.applications || [];
        displayRecentTransactions();
    } catch (error) {
        console.error('Failed to load transactions:', error);
    }
}

// ============================================
// Statistics Display
// ============================================

function updateStatisticsDisplay() {
    const stats = STATE.statistics;
    const total = stats.total || 0;
    const pending = stats.pending || 0;
    const paid = stats.paid || 0;
    const collected = parseFloat(stats.total_collected || 0);
    const avgPayment = total > 0 ? collected / total : 0;
    const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    // Update main stats
    document.getElementById('totalPayments').textContent = total;
    document.getElementById('pendingPayments').textContent = pending;
    document.getElementById('paidPayments').textContent = paid;
    document.getElementById('totalCollected').textContent = formatCurrency(collected);
    document.getElementById('avgPayment').textContent = `Avg: ₱${formatCurrency(avgPayment)}`;

    // Update collection rate
    document.getElementById('collectionRate').textContent = `${collectionRate}%`;
    document.getElementById('circleProgress').style.strokeDashoffset = 
        251.2 - (collectionRate / 100) * 251.2;

    // Update progress bar
    const paidProgress = document.getElementById('paidProgress');
    paidProgress.style.width = `${Math.min(paid / total * 100, 100)}%`;

    // Update breakdown
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('processingCount').textContent = stats.processing || 0;
    document.getElementById('completedCount').textContent = paid;

    // Update trends
    const totalTrend = document.getElementById('totalTrend');
    if (stats.trend) {
        const trendValue = stats.trend > 0 ? '+' : '';
        const trendClass = stats.trend > 0 ? 'success' : 'warning';
        totalTrend.innerHTML = `
            <span class="trend-badge" style="background: ${stats.trend > 0 ? '#d1fae5' : '#fee2e2'}; color: ${stats.trend > 0 ? '#065f46' : '#7f1d1d'};">
                ${trendValue}${stats.trend}%
            </span> from last month
        `;
    }
}

function displayRecentTransactions() {
    const loadingEl = document.getElementById('recentTransactionsLoading');
    const emptyEl = document.getElementById('recentTransactionsEmpty');
    const tableEl = document.getElementById('recentTransactionsTable');

    if (STATE.recentTransactions.length === 0) {
        loadingEl.style.display = 'none';
        emptyEl.classList.remove('hidden');
        tableEl.classList.add('hidden');
        return;
    }

    loadingEl.style.display = 'none';
    emptyEl.classList.add('hidden');
    tableEl.classList.remove('hidden');

    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    STATE.recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const status = transaction.payment_record_id ? 'completed' : 'pending';
        const statusText = transaction.payment_record_id ? 'Assigned' : 'Pending';

        const date = transaction.created_at 
            ? formatDate(transaction.created_at) 
            : 'N/A';

        row.innerHTML = `
            <td><strong>${transaction.first_name} ${transaction.last_name}</strong></td>
            <td>#${transaction.application_id}</td>
            <td>${transaction.scheme_name || 'N/A'}</td>
            <td>₱${formatCurrency(transaction.total_amount || 0)}</td>
            <td>
                <span class="status-badge ${status}">
                    ${status === 'completed' ? '✓' : '⏳'} ${statusText}
                </span>
            </td>
            <td>${date}</td>
        `;

        tbody.appendChild(row);
    });
}

// ============================================
// User Information
// ============================================

function displayUserInfo() {
    const user = STATE.user;
    
    document.getElementById('userName').textContent = user.fullName || 'User';
    document.getElementById('userEmail').textContent = user.email || 'user@example.com';
    
    // Generate avatar
    const initials = (user.fullName || 'User')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    
    document.getElementById('userAvatar').textContent = initials;
}

// ============================================
// Actions
// ============================================

function generateReport() {
    const stats = STATE.statistics;
    
    const report = `
FINANCIAL REPORT
================
Generated: ${new Date().toLocaleString()}
Period: This Month

KEY METRICS:
- Total Payment Records: ${stats.total || 0}
- Pending Payments: ${stats.pending || 0}
- Completed Payments: ${stats.paid || 0}
- Total Collected: ₱${formatCurrency(stats.total_collected || 0)}
- Collection Rate: ${stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
- Average Payment: ₱${stats.total > 0 ? formatCurrency(parseFloat(stats.total_collected || 0) / stats.total) : '0.00'}

STATUS BREAKDOWN:
- Pending: ${stats.pending || 0}
- Processing: ${stats.processing || 0}
- Completed: ${stats.paid || 0}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Report generated successfully', 'success');
}

function refreshDashboard() {
    loadStatistics();
    loadRecentTransactions();
    showToast('Dashboard refreshed', 'info');
}


// ============================================
// Auto-Refresh
// ============================================

function setupAutoRefresh() {
    STATE.refreshTimer = setInterval(() => {
        loadStatistics();
        loadRecentTransactions();
    }, CONFIG.REFRESH_INTERVAL);
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    displayUserInfo();
    await loadStatistics();
    await loadRecentTransactions();
    setupAutoRefresh();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (STATE.refreshTimer) {
        clearInterval(STATE.refreshTimer);
    }
});
