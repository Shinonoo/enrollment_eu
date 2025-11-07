const token = localStorage.getItem('token');
let detectionCompleted = false;
let promotionCompleted = false;

function showAlert(message, type = 'warning') {
    const alertBox = document.getElementById('alertBox');
    alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

async function detectReturningStudents() {
    try {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Detecting...';

        const response = await fetch('http://localhost:3000/api/sections/succession/detect-returning', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            detectionCompleted = true;
            document.getElementById('step1-status').textContent = `✓ Found ${data.returningCount} returning students`;
            document.getElementById('step1-status').className = 'step-status status-completed';
            document.getElementById('promoteBtn').disabled = false;
            showAlert(`✓ Detected ${data.returningCount} returning students`, 'success');
        } else {
            showAlert(data.message || 'Failed to detect returning students', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Connection error', 'error');
    } finally {
        event.target.disabled = false;
        event.target.textContent = 'Detect';
    }
}

async function promoteStudents() {
    try {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Promoting...';

        const studentsResponse = await fetch('http://localhost:3000/api/students?enrollmentStatus=enrolled', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const studentsData = await studentsResponse.json();
        const studentIds = studentsData.students.map(s => s.student_id);

        const response = await fetch('http://localhost:3000/api/sections/succession/promote', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentIds })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            promotionCompleted = true;
            document.getElementById('step2-status').textContent = `✓ Promoted ${data.promotedCount} students`;
            document.getElementById('step2-status').className = 'step-status status-completed';
            document.getElementById('executeBtn').disabled = false;
            showAlert(`✓ Successfully promoted ${data.promotedCount} students`, 'success');
        } else {
            showAlert(data.message || 'Failed to promote students', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Connection error', 'error');
    } finally {
        event.target.disabled = false;
        event.target.textContent = 'Promote';
    }
}

function confirmExecute() {
    if (!detectionCompleted || !promotionCompleted) {
        showAlert('Please complete steps 1 and 2 first', 'warning');
        return;
    }
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

async function executeSuccession() {
    try {
        const response = await fetch('http://localhost:3000/api/sections/succession/execute', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        closeConfirmModal();

        if (response.ok && data.success) {
            document.getElementById('step3-status').textContent = '✓ Succession Completed';
            document.getElementById('step3-status').className = 'step-status status-completed';

            document.getElementById('resultsBox').classList.remove('hidden');
            document.getElementById('resultDetails').innerHTML = `
                        <p><strong>Current Year:</strong> ${data.summary.currentYear}</p>
                        <p><strong>New Year:</strong> ${data.summary.nextYear}</p>
                        <p><strong>Promoted:</strong> ${data.summary.promotedCount} students</p>
                        <p><strong>Graduated:</strong> ${data.summary.graduatedCount} students</p>
                        ${data.summary.errors.length > 0 ? `
                            <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 0.5rem;">
                                <strong>Warnings:</strong>
                                <ul style="margin: 0.5rem 0 0 1.5rem;">
                                    ${data.summary.errors.map(e => `<li>${e}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    `;

            showAlert('✓ Year-end succession completed successfully!', 'success');
            loadProgressionMap();
        } else {
            showAlert(data.message || 'Failed to execute succession', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Connection error', 'error');
    }
}

async function loadProgressionMap() {
    try {
        const response = await fetch('http://localhost:3000/api/sections/succession/progression-map', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const map = data.progressionMap;
            let html = `
                        <p style="margin-bottom: 1rem; color: #6b7280;">
                            Current Year: <strong>${data.currentYear}</strong> → Next Year: <strong>${data.nextYear}</strong>
                        </p>
                        <div class="section-flow">
                    `;

            map.forEach(item => {
                html += `
                            <div class="flow-item">
                                <strong>${item.current_section}</strong>
                                <span style="font-size: 0.875rem; color: #6b7280;">Grade ${item.current_grade}</span>
                                <div class="count">${item.student_count} students</div>
                                <div class="arrow">→</div>
                                <strong>${item.next_section || 'Graduate'}</strong>
                                <span style="font-size: 0.875rem; color: #6b7280;">
                                    ${item.next_section ? `Grade ${item.next_grade}` : 'Graduation'}
                                </span>
                            </div>
                        `;
            });

            html += '</div>';
            document.getElementById('progressionContent').innerHTML = html;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('progressionContent').innerHTML = '<p style="color: #ef4444;">Failed to load progression map</p>';
    }
}

// Load progression map on page load
document.addEventListener('DOMContentLoaded', loadProgressionMap);

// Close modal when clicking outside
document.getElementById('confirmModal').addEventListener('click', function (e) {
    if (e.target === this) closeConfirmModal();
});
