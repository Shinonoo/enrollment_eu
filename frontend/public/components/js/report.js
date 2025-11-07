const token = localStorage.getItem('token');
let typeChart, levelChart, gradeChart, statusChart;

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName + '-tab').classList.remove('hidden');
    event.target.classList.add('active');

    if (tabName === 'charts') loadCharts();
    if (tabName === 'history') loadReportHistory();
}

async function loadCharts() {
    try {
        const types = ['by_type', 'by_level', 'by_grade', 'by_status'];
        const canvasIds = ['typeChart', 'levelChart', 'gradeChart', 'statusChart'];

        for (let i = 0; i < types.length; i++) {
            const response = await fetch(`http://localhost:3000/api/reports/chart/statistics?statType=${types[i]}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                renderChart(canvasIds[i], data.data);
            }
        }
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

function renderChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (window[canvasId + '_instance']) {
        window[canvasId + '_instance'].destroy();
    }

    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

    window[canvasId + '_instance'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: colors.slice(0, data.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20 }
                }
            }
        }
    });
}

async function generateDailyReport(e) {
    e.preventDefault();
    const date = document.getElementById('dailyDate').value;

    try {
        const response = await fetch('http://localhost:3000/api/reports/daily', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reportDate: date })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const resultDiv = document.getElementById('dailyResult');
            resultDiv.innerHTML = `
                        <div class="stat-box">
                            <h4>✅ Report Generated</h4>
                            <div class="value">${data.report.total_enrollments}</div>
                            <p style="margin-top: 0.5rem;">Total Enrollments</p>
                        </div>
                    `;
            resultDiv.classList.remove('hidden');
        } else {
            alert(data.message || 'Failed to generate report');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function generateMonthlyReport(e) {
    e.preventDefault();
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('monthYear').value;

    try {
        const response = await fetch('http://localhost:3000/api/reports/monthly', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ month: parseInt(month), year: parseInt(year) })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const resultDiv = document.getElementById('monthlyResult');
            resultDiv.innerHTML = `
                        <div class="stat-box">
                            <h4>✅ Report Generated</h4>
                            <div class="value">${data.report.total_enrollments}</div>
                            <p style="margin-top: 0.5rem;">Total Enrollments</p>
                        </div>
                    `;
            resultDiv.classList.remove('hidden');
        } else {
            alert(data.message || 'Failed to generate report');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function generateYearlyReport(e) {
    e.preventDefault();
    const schoolYear = document.getElementById('schoolYear').value;

    try {
        const response = await fetch('http://localhost:3000/api/reports/yearly', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ schoolYear })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const resultDiv = document.getElementById('yearlyResult');
            resultDiv.innerHTML = `
                        <div class="stat-box">
                            <h4>✅ Report Generated</h4>
                            <div class="value">${data.report.total_enrollments}</div>
                            <p style="margin-top: 0.5rem;">Total Enrollments</p>
                        </div>
                    `;
            resultDiv.classList.remove('hidden');
        } else {
            alert(data.message || 'Failed to generate report');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function loadReportHistory() {
    const type = document.getElementById('reportTypeFilter').value;

    try {
        let url = 'http://localhost:3000/api/reports?';
        if (type) url += `reportType=${type}&`;

        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            displayReportHistory(data.reports);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayReportHistory(reports) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';

    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No reports found</td></tr>';
        return;
    }

    reports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td><strong>${report.report_type.toUpperCase()}</strong></td>
                    <td>${new Date(report.report_date).toLocaleDateString()}</td>
                    <td>${report.total_enrollments}</td>
                    <td>${report.new_students}</td>
                    <td>${report.returning_students}</td>
                    <td>${report.transferees}</td>
                    <td>${report.jhs_count}</td>
                    <td>${report.shs_count}</td>
                `;
        tbody.appendChild(row);
    });
}

// Set today's date in daily report
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dailyDate').value = today;
    loadCharts();
});
