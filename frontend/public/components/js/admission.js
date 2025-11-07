const token = localStorage.getItem('token');
if (!token) window.location.href = '/views/public/login.html';

async function loadApplications() {
    const status = document.getElementById('filterStatus').value;
    const level = document.getElementById('filterLevel').value;
    const grade = document.getElementById('filterGrade').value;
    const type = document.getElementById('filterType').value;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('applicationsTable').style.display = 'none';

    try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (level) params.append('schoolLevel', level);
        if (grade) params.append('gradeLevel', grade);
        if (type) params.append('applicationType', type);

        const response = await fetch('http://localhost:3000/api/admission?' + params.toString(), {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        document.getElementById('loading').style.display = 'none';

        if (response.ok && data.success) {
            if (data.applications.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayApplications(data.applications);
            }
        } else {
            alert('Failed to load applications');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Connection error');
    }
}

function displayApplications(applications) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    applications.forEach(app => {
        const row = document.createElement('tr');
        const date = new Date(app.submitted_at).toLocaleDateString();

        row.innerHTML = `
                    <td>#${app.application_id}</td>
                    <td><strong>${app.first_name} ${app.last_name}</strong></td>
                    <td><span class="badge badge-${app.school_level.toLowerCase()}">${app.school_level}</span></td>
                    <td>Grade ${app.grade_level}</td>
                    <td>${app.application_type}</td>
                    <td><span class="badge badge-${app.status}">${app.status}</span></td>
                    <td>${date}</td>
                    <td>
                        <div class="action-buttons">
                            ${app.status === 'pending' ? `
                                <button onclick="approveApplication(${app.application_id})" class="btn btn-success btn-sm">Approve</button>
                                <button onclick="rejectApplication(${app.application_id})" class="btn btn-danger btn-sm">Reject</button>
                            ` : ''}
                            ${app.status === 'approved' && !app.sent_to_accountant_at ? `
                                <button onclick="sendToAccountant(${app.application_id})" class="btn btn-primary btn-sm">Send to Accountant</button>
                            ` : ''}
                            ${app.sent_to_accountant_at ? '<span class="badge badge-primary">Sent to Accountant</span>' : ''}
                            <button onclick="viewDetails(${app.application_id})" class="btn btn-primary btn-sm">View</button>
                        </div>
                    </td>
                `;
        tbody.appendChild(row);
    });

    document.getElementById('applicationsTable').style.display = 'table';
}

async function approveApplication(id) {
    if (!confirm('Approve this application?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Application approved successfully!');
            loadApplications();
        } else {
            alert(data.message || 'Failed to approve application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function rejectApplication(id) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'rejected',
                rejectionReason: reason
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Application rejected');
            loadApplications();
        } else {
            alert(data.message || 'Failed to reject application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function viewDetails(id) {
    try {
        const modal = document.getElementById('detailsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('modalContent').innerHTML = '<p style="text-align: center; padding: 2rem;">Loading...</p>';

        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayApplicationDetails(data.application);
        } else {
            document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Failed to load details</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Connection error</p>';
    }
}

function displayApplicationDetails(app) {
    const date = new Date(app.submitted_at).toLocaleString();
    const dob = new Date(app.date_of_birth).toLocaleDateString();

    document.getElementById('modalContent').innerHTML = `
                <div class="detail-section">
                    <h3>Application Information</h3>
                    <div class="info-box detail-grid">
                        <div><strong>ID:</strong> #${app.application_id}</div>
                        <div><strong>Status:</strong> <span class="badge badge-${app.status}">${app.status}</span></div>
                        <div><strong>Submitted:</strong> ${date}</div>
                        <div><strong>Type:</strong> ${app.application_type}</div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Personal Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>First Name:</strong>
                            <span>${app.first_name}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Middle Name:</strong>
                            <span>${app.middle_name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Last Name:</strong>
                            <span>${app.last_name}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Suffix:</strong>
                            <span>${app.suffix || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Date of Birth:</strong>
                            <span>${dob}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Gender:</strong>
                            <span>${app.gender}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Contact Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>Email:</strong>
                            <span>${app.email || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Phone:</strong>
                            <span>${app.phone_number || 'N/A'}</span>
                        </div>
                        <div class="detail-item" style="grid-column: 1 / -1;">
                            <strong>Address:</strong>
                            <span>${app.address_line1}${app.address_line2 ? ', ' + app.address_line2 : ''}, ${app.city}, ${app.province} ${app.zip_code || ''}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Guardian Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>Name:</strong>
                            <span>${app.guardian_name}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Relationship:</strong>
                            <span>${app.guardian_relationship}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Phone:</strong>
                            <span>${app.guardian_phone}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong>
                            <span>${app.guardian_email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Academic Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>School Level:</strong>
                            <span class="badge badge-${app.school_level.toLowerCase()}">${app.school_level}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Grade Level:</strong>
                            <span>Grade ${app.grade_level}</span>
                        </div>
                        ${app.strand ? `<div class="detail-item">
                            <strong>Strand:</strong>
                            <span>${app.strand}</span>
                        </div>` : ''}
                        <div class="detail-item">
                            <strong>Previous School:</strong>
                            <span>${app.previous_school || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                ${app.rejection_reason ? `
                    <div class="detail-section">
                        <h3>Rejection Reason</h3>
                        <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; color: #991b1b;">
                            ${app.rejection_reason}
                        </div>
                    </div>
                ` : ''}
            `;
}

function closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

document.getElementById('detailsModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

async function sendToAccountant(id) {
    if (!confirm('Send this application to accountant for payment processing?')) return;

    try {
        const response = await fetch('http://localhost:3000/api/admission/send-to-accountant', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ applicationIds: [id] })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Application sent to accountant successfully!');
            loadApplications();
        } else {
            alert(data.message || 'Failed to send application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

loadApplications();