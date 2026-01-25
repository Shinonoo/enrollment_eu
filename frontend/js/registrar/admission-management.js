// ============================================
// AUTHENTICATION & INITIALIZATION
// ============================================

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/pages/public/login.html';
}

// Load applications on page load
document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
});

// ============================================
// LOAD & DISPLAY APPLICATIONS
// ============================================

/**
 * Load applications with optional filters
 */
async function loadApplications() {
    const status = document.getElementById('filterStatus').value;
    const level = document.getElementById('filterLevel').value;
    const grade = document.getElementById('filterGrade').value;
    const type = document.getElementById('filterType').value;

    // Show loading state
    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('applicationsTable').style.display = 'none';

    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (level) params.append('schoolLevel', level);
        if (grade) params.append('gradeLevel', grade);
        if (type) params.append('applicationType', type);

        const response = await fetch(`http://localhost:3000/api/admission?${params.toString()}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        document.getElementById('loading').style.display = 'none';

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            if (data.applications.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
                const hasFilters = status || level || grade || type;
                document.getElementById('emptyState').textContent = hasFilters 
                    ? 'No applications match the selected filters' 
                    : 'No applications found';
            } else {
                displayApplications(data.applications);
            }
        } else {
            throw new Error(data.message || 'Failed to load applications');
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('emptyState').textContent = 'Error loading applications. Please try again.';
        alert(`Failed to load applications: ${error.message}`);
    }
}

/**
 * Display applications in table
 */
function displayApplications(applications) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    applications.forEach(app => {
        const row = document.createElement('tr');
        const date = new Date(app.submitted_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        const fullName = [app.first_name, app.middle_name, app.last_name, app.suffix]
            .filter(Boolean)
            .join(' ');

        row.innerHTML = `
            <td>#${app.admission_id}</td>
            <td><strong>${fullName}</strong></td>
            <td><span class="badge badge-${app.school_level.toLowerCase()}">${app.school_level}</span></td>
            <td>Grade ${app.grade_level}${app.strand ? ` - ${app.strand}` : ''}</td>
            <td>${capitalize(app.application_type)}</td>
            <td><span class="badge badge-${app.status}">${capitalize(app.status)}</span></td>
            <td>${date}</td>
            <td>
                <div class="action-buttons">
                    ${app.status === 'pending' ? `
                        <button onclick="approveApplication(${app.admission_id})" class="btn btn-success btn-sm" title="Approve Application">Approve</button>
                        <button onclick="rejectApplication(${app.admission_id})" class="btn btn-danger btn-sm" title="Reject Application">Reject</button>
                        <button onclick="openEditModal(${app.admission_id})" class="btn btn-warning btn-sm" title="Edit Application">Edit</button>
                    ` : ''}
                    ${app.status === 'approved' && !app.sent_to_accounting_at ? `
                        <button onclick="sendToAccounting(${app.admission_id})" class="btn btn-primary btn-sm" title="Send to Accounting">Send to Accounting</button>
                    ` : ''}
                    ${app.sent_to_accounting_at ? `<span class="badge badge-success" title="Sent on ${new Date(app.sent_to_accounting_at).toLocaleString()}">Sent to Accounting</span>` : ''}
                    <button onclick="viewDetails(${app.admission_id})" class="btn btn-primary btn-sm" title="View Details">View</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('applicationsTable').style.display = 'table';
}


/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterLevel').value = '';
    document.getElementById('filterGrade').value = '';
    document.getElementById('filterType').value = '';
    loadApplications();
}

// ============================================
// APPLICATION ACTIONS
// ============================================

/**
 * Approve application
 */
async function approveApplication(id) {
    if (!confirm('Approve this application?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
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

/**
 * Reject application
 */
async function rejectApplication(id) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'rejected',
                remarks: reason
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

/**
 * Send approved application to accountant
 */
async function sendToAccountant(id) {
    if (!confirm('Send this application to accountant for payment processing?')) return;

    try {
        const response = await fetch('http://localhost:3000/api/admission/send-to-accountant', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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

// ============================================
// VIEW DETAILS MODAL
// ============================================

/**
 * View application details
 */
async function viewDetails(id) {
    try {
        const modal = document.getElementById('detailsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('modalContent').innerHTML = '<p style="text-align: center; padding: 2rem;">Loading...</p>';

        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayApplicationDetails(data.admission);
        } else {
            document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Failed to load details</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Connection error</p>';
    }
}

/**
 * Display full application details in modal
 */
function displayApplicationDetails(app) {
    const date = new Date(app.submitted_at).toLocaleString();
    const dob = new Date(app.date_of_birth).toLocaleDateString();
    const fullAddress = [app.street_address, app.barangay, app.city_municipality, app.province, app.zip_code]
        .filter(Boolean)
        .join(', ');

    document.getElementById('modalContent').innerHTML = `
        <div class="detail-section">
            <h3>Application Information</h3>
            <div class="info-box detail-grid">
                <div><strong>Application Number:</strong> ${app.application_number}</div>
                <div><strong>Status:</strong> <span class="badge badge-${app.current_status}">${app.current_status}</span></div>
                <div><strong>Submitted:</strong> ${date}</div>
                <div><strong>Type:</strong> ${app.application_type}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><strong>First Name:</strong> <span>${app.first_name}</span></div>
                <div class="detail-item"><strong>Middle Name:</strong> <span>${app.middle_name || 'N/A'}</span></div>
                <div class="detail-item"><strong>Last Name:</strong> <span>${app.last_name}</span></div>
                <div class="detail-item"><strong>Suffix:</strong> <span>${app.suffix || 'N/A'}</span></div>
                <div class="detail-item"><strong>Date of Birth:</strong> <span>${dob}</span></div>
                <div class="detail-item"><strong>Age:</strong> <span>${app.age}</span></div>
                <div class="detail-item"><strong>Gender:</strong> <span>${app.gender}</span></div>
                <div class="detail-item"><strong>Place of Birth:</strong> <span>${app.place_of_birth || 'N/A'}</span></div>
                <div class="detail-item"><strong>Nationality:</strong> <span>${app.nationality || 'N/A'}</span></div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Contact Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><strong>Email:</strong> <span>${app.email || 'N/A'}</span></div>
                <div class="detail-item"><strong>Phone:</strong> <span>${app.phone_number || 'N/A'}</span></div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <strong>Address:</strong> <span>${fullAddress}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Guardian Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><strong>Name:</strong> <span>${app.guardian_name}</span></div>
                <div class="detail-item"><strong>Relationship:</strong> <span>${app.guardian_relationship}</span></div>
                <div class="detail-item"><strong>Phone:</strong> <span>${app.guardian_phone}</span></div>
                <div class="detail-item"><strong>Email:</strong> <span>${app.guardian_email || 'N/A'}</span></div>
                ${app.guardian_address ? `<div class="detail-item" style="grid-column: 1 / -1;"><strong>Address:</strong> <span>${app.guardian_address}</span></div>` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h3>Academic Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><strong>LRN:</strong> <span>${app.lrn}</span></div>
                <div class="detail-item"><strong>School Level:</strong> <span class="badge badge-${app.school_level.toLowerCase()}">${app.school_level}</span></div>
                <div class="detail-item"><strong>Grade Level:</strong> <span>${app.grade_name}</span></div>
                ${app.strand_name ? `<div class="detail-item"><strong>Strand:</strong> <span>${app.strand_name}</span></div>` : ''}
                <div class="detail-item"><strong>Previous School:</strong> <span>${app.previous_school_name || 'N/A'}</span></div>
                <div class="detail-item"><strong>Last Grade Completed:</strong> <span>${app.last_grade_completed || 'N/A'}</span></div>
                <div class="detail-item"><strong>Year Completed:</strong> <span>${app.year_completed || 'N/A'}</span></div>
                <div class="detail-item"><strong>General Average:</strong> <span>${app.general_average || 'N/A'}</span></div>
                ${app.referral_source ? `<div class="detail-item"><strong>Referral Source:</strong> <span>${app.referral_source}</span></div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Close details modal
 */
function closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Close modal on outside click
document.getElementById('detailsModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// ============================================
// EDIT MODAL
// ============================================

/**
 * Open edit modal and load application data
 */
async function openEditModal(id) {
    try {
        const modal = document.getElementById('editModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);

        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            populateEditForm(data.admission);
        } else {
            alert('Failed to load application data');
            closeEditModal();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
        closeEditModal();
    }
}

/**
 * Populate edit form with application data
 */
function populateEditForm(app) {
    document.getElementById('edit_application_id').value = app.admission_id;
    document.getElementById('edit_first_name').value = app.first_name;
    document.getElementById('edit_middle_name').value = app.middle_name || '';
    document.getElementById('edit_last_name').value = app.last_name;
    document.getElementById('edit_suffix').value = app.suffix || '';
    document.getElementById('edit_date_of_birth').value = app.date_of_birth.split('T')[0];
    document.getElementById('edit_age').value = app.age;
    document.getElementById('edit_gender').value = app.gender;
    document.getElementById('edit_place_of_birth').value = app.place_of_birth || '';
    document.getElementById('edit_nationality').value = app.nationality || 'Filipino';
    document.getElementById('edit_email').value = app.email || '';
    document.getElementById('edit_phone_number').value = app.phone_number || '';
    document.getElementById('edit_street').value = app.street_address;
    document.getElementById('edit_barangay').value = app.barangay || '';
    document.getElementById('edit_city').value = app.city_municipality;
    document.getElementById('edit_province').value = app.province;
    document.getElementById('edit_zip_code').value = app.zip_code || '';
    
    // Guardian info
    document.querySelector('#editGuardiansContainer .guardian-name').value = app.guardian_name;
    document.querySelector('#editGuardiansContainer .guardian-relationship').value = app.guardian_relationship;
    document.querySelector('#editGuardiansContainer .guardian-phone').value = app.guardian_phone;
    document.querySelector('#editGuardiansContainer .guardian-email').value = app.guardian_email || '';
    document.querySelector('#editGuardiansContainer .guardian-address').value = app.guardian_address || '';
    
    // Academic info
    document.getElementById('edit_lrn').value = app.lrn;
    document.getElementById('edit_school_level').value = app.school_level;
    handleEditSchoolLevelChange();
    document.getElementById('edit_grade_level').value = app.grade_name.replace('Grade ', '');
    document.getElementById('edit_previous_school').value = app.previous_school_name || '';
    document.getElementById('edit_last_grade_completed').value = app.last_grade_completed || '';
    document.getElementById('edit_year_completed').value = app.year_completed || '';
    document.getElementById('edit_general_average').value = app.general_average || '';
    document.getElementById('edit_application_type').value = app.application_type;
    document.getElementById('edit_referral_source').value = app.referral_source || '';
    
    if (app.strand_code) {
        document.getElementById('edit_strand').value = app.strand_code;
    }
}

/**
 * Handle school level change in edit form
 */
function handleEditSchoolLevelChange() {
    const level = document.getElementById('edit_school_level').value;
    const gradeSelect = document.getElementById('edit_grade_level');
    const strandGroup = document.getElementById('edit_strand_group');
    const strandSelect = document.getElementById('edit_strand');
    
    gradeSelect.innerHTML = '<option value="">Select Grade</option>';
    
    if (level === 'JHS') {
        [7, 8, 9, 10].forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">Grade ${grade}</option>`;
        });
        strandGroup.style.display = 'none';
        strandSelect.removeAttribute('required');
    } else if (level === 'SHS') {
        [11, 12].forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">Grade ${grade}</option>`;
        });
        strandGroup.style.display = 'block';
        strandSelect.setAttribute('required', 'required');
    }
}

/**
 * Submit edit form
 */
async function submitEdit() {
    const form = document.getElementById('editForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('edit_application_id').value;
    
    // Collect all form data
    const updateData = {
        firstName: document.getElementById('edit_first_name').value,
        middleName: document.getElementById('edit_middle_name').value || null,
        lastName: document.getElementById('edit_last_name').value,
        suffix: document.getElementById('edit_suffix').value || null,
        dateOfBirth: document.getElementById('edit_date_of_birth').value,
        age: parseInt(document.getElementById('edit_age').value),
        gender: document.getElementById('edit_gender').value,
        placeOfBirth: document.getElementById('edit_place_of_birth').value,
        nationality: document.getElementById('edit_nationality').value,
        email: document.getElementById('edit_email').value || null,
        phoneNumber: document.getElementById('edit_phone_number').value || null,
        streetAddress: document.getElementById('edit_street').value,
        barangay: document.getElementById('edit_barangay').value,
        city: document.getElementById('edit_city').value,
        province: document.getElementById('edit_province').value,
        zipCode: document.getElementById('edit_zip_code').value || null,
        guardianName: document.querySelector('#editGuardiansContainer .guardian-name').value,
        guardianRelationship: document.querySelector('#editGuardiansContainer .guardian-relationship').value,
        guardianPhone: document.querySelector('#editGuardiansContainer .guardian-phone').value,
        guardianEmail: document.querySelector('#editGuardiansContainer .guardian-email').value || null,
        guardianAddress: document.querySelector('#editGuardiansContainer .guardian-address').value || null,
        lrn: document.getElementById('edit_lrn').value,
        schoolLevel: document.getElementById('edit_school_level').value,
        gradeLevel: document.getElementById('edit_grade_level').value,
        strand: document.getElementById('edit_strand').value || null,
        previousSchool: document.getElementById('edit_previous_school').value,
        lastGradeCompleted: document.getElementById('edit_last_grade_completed').value,
        yearCompleted: document.getElementById('edit_year_completed').value,
        generalAverage: parseFloat(document.getElementById('edit_general_average').value),
        applicationType: document.getElementById('edit_application_type').value,
        referralSource: document.getElementById('edit_referral_source').value || null
    };

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Application updated successfully!');
            closeEditModal();
            loadApplications();
        } else {
            alert(data.message || 'Failed to update application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Close edit modal on outside click
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// ============================================
// NEW APPLICATION MODAL
// ============================================

/**
 * Open new application modal
 */
function openNewApplicationModal() {
    const modal = document.getElementById('newApplicationModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
    clearNewApplicationForm();
}

/**
 * Close new application modal
 */
function closeNewApplicationModal() {
    const modal = document.getElementById('newApplicationModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

/**
 * Clear new application form
 */
function clearNewApplicationForm() {
    document.getElementById('newApplicationForm').reset();
    document.getElementById('new_strand_group').style.display = 'none';
    document.getElementById('new_strand').removeAttribute('required');
    const gradeSelect = document.getElementById('new_grade_level');
    gradeSelect.innerHTML = '<option value="">Select Grade</option>';
}

/**
 * Handle school level change in new application form
 */
function handleNewSchoolLevelChange() {
    const level = document.getElementById('new_school_level').value;
    const gradeSelect = document.getElementById('new_grade_level');
    const strandGroup = document.getElementById('new_strand_group');
    const strandSelect = document.getElementById('new_strand');

    gradeSelect.innerHTML = '<option value="">Select Grade</option>';

    if (level === 'JHS') {
        [7, 8, 9, 10].forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">Grade ${grade}</option>`;
        });
        strandGroup.style.display = 'none';
        strandSelect.removeAttribute('required');
    } else if (level === 'SHS') {
        [11, 12].forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">Grade ${grade}</option>`;
        });
        strandGroup.style.display = 'block';
        strandSelect.setAttribute('required', 'required');
    }
}

/**
 * Submit new application
 */
async function submitNewApplication() {
    const form = document.getElementById('newApplicationForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('firstName', document.getElementById('new_first_name').value);
    formData.append('middleName', document.getElementById('new_middle_name').value || '');
    formData.append('lastName', document.getElementById('new_last_name').value);
    formData.append('suffix', document.getElementById('new_suffix').value || '');
    formData.append('dateOfBirth', document.getElementById('new_date_of_birth').value);
    formData.append('age', document.getElementById('new_age').value);
    formData.append('gender', document.getElementById('new_gender').value);
    formData.append('placeOfBirth', document.getElementById('new_place_of_birth').value);
    formData.append('nationality', document.getElementById('new_nationality').value);
    formData.append('email', document.getElementById('new_email').value || '');
    formData.append('phoneNumber', document.getElementById('new_phone_number').value || '');
    formData.append('streetAddress', document.getElementById('new_street').value);
    formData.append('barangay', document.getElementById('new_barangay').value);
    formData.append('city', document.getElementById('new_city').value);
    formData.append('province', document.getElementById('new_province').value);
    formData.append('zipCode', document.getElementById('new_zip_code').value || '');
    formData.append('guardianName', document.getElementById('new_guardian_name').value);
    formData.append('guardianRelationship', document.getElementById('new_guardian_relationship').value);
    formData.append('guardianPhone', document.getElementById('new_guardian_phone').value);
    formData.append('guardianEmail', document.getElementById('new_guardian_email').value || '');
    formData.append('guardianAddress', document.getElementById('new_guardian_address').value || '');
    formData.append('lrn', document.getElementById('new_lrn').value);
    formData.append('schoolLevel', document.getElementById('new_school_level').value);
    formData.append('gradeLevel', document.getElementById('new_grade_level').value);
    formData.append('strand', document.getElementById('new_strand').value || '');
    formData.append('previousSchool', document.getElementById('new_previous_school').value);
    formData.append('lastGradeCompleted', document.getElementById('new_last_grade_completed').value);
    formData.append('yearCompleted', document.getElementById('new_year_completed').value);
    formData.append('generalAverage', document.getElementById('new_general_average').value);
    formData.append('applicationType', document.getElementById('new_application_type').value);
    formData.append('referralSource', document.getElementById('new_referral_source').value || '');
    formData.append('paymentScheme', document.getElementById('new_payment_scheme').value);
    
    // Add photo if selected
    const photoInput = document.getElementById('new_student_photo');
    if (photoInput.files[0]) {
        formData.append('studentPhoto', photoInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/admission/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`Application submitted successfully! Application Number: ${data.applicationNumber}`);
            closeNewApplicationModal();
            loadApplications();
        } else {
            alert(data.message || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

// Close new application modal on outside click
document.getElementById('newApplicationModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeNewApplicationModal();
    }
});
