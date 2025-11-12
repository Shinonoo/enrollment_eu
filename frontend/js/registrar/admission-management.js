const token = localStorage.getItem('token');
if (!token) window.location.href = '/pages/public/login.html';

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
                        <button onclick="openEditModal(${app.application_id})" class="btn btn-warning btn-sm">Edit</button>
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

async function submitForm(e) {
    e.preventDefault();
    hideAlert();
    
    if (!validateStep5()) {
        return;
    }
    
    collectFormData();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Transform form field names to database column names
        const dbData = transformDataForDatabase();
        
        // 🔍 DEBUG: Log exactly what's being sent
        console.log('=== DEBUGGING ===');
        console.log('Form Data collected:', STATE.formData);
        console.log('Transformed Data being sent:', dbData);
        console.log('JSON String:', JSON.stringify(dbData, null, 2));
        console.log('================');
        
        const response = await fetch(`${CONFIG.API_BASE}/admission/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbData)
        });
        
        const result = await response.json();
        
        console.log('Response Status:', response.status);
        console.log('Response Data:', result);
        
        if (response.ok && result.success) {
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('referenceNumber').textContent = result.referenceNumber || result.applicationId;
            
            clearFormData();
            showToast('Application submitted successfully!', 'success');
        } else {
            showAlert(result.error + ': ' + result.message || 'Failed to submit application', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('Connection error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
}

// Open Edit Modal and populate form
async function openEditModal(id) {
    try {
        const modal = document.getElementById('editModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);

        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            populateEditForm(data.application);
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

// Populate edit form with application data
function populateEditForm(app) {
    document.getElementById('edit_application_id').value = app.application_id;
    document.getElementById('edit_first_name').value = app.first_name;
    document.getElementById('edit_middle_name').value = app.middle_name || '';
    document.getElementById('edit_last_name').value = app.last_name;
    document.getElementById('edit_suffix').value = app.suffix || '';
    document.getElementById('edit_date_of_birth').value = app.date_of_birth.split('T')[0];
    document.getElementById('edit_gender').value = app.gender;
    document.getElementById('edit_email').value = app.email || '';
    document.getElementById('edit_phone_number').value = app.phone_number || '';
    document.getElementById('edit_street').value = app.street;
    document.getElementById('edit_barangay').value = app.barangay || '';
    document.getElementById('edit_city').value = app.city;
    document.getElementById('edit_province').value = app.province;
    document.getElementById('edit_zip_code').value = app.zip_code || '';
    document.getElementById('edit_guardian_name').value = app.guardian_name;
    document.getElementById('edit_guardian_relationship').value = app.guardian_relationship;
    document.getElementById('edit_guardian_phone').value = app.guardian_phone;
    document.getElementById('edit_guardian_email').value = app.guardian_email || '';
    document.getElementById('edit_school_level').value = app.school_level;
    document.getElementById('edit_application_type').value = app.application_type;
    document.getElementById('edit_previous_school').value = app.previous_school || '';
    
    // Handle grade level and strand
    handleEditSchoolLevelChange();
    document.getElementById('edit_grade_level').value = app.grade_level;
    
    if (app.strand) {
        document.getElementById('edit_strand').value = app.strand;
    }
}

// Handle school level change for grade options
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

// Submit edit form
async function submitEdit() {
    const form = document.getElementById('editForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('edit_application_id').value;
    const updateData = {
        first_name: document.getElementById('edit_first_name').value,
        middle_name: document.getElementById('edit_middle_name').value,
        last_name: document.getElementById('edit_last_name').value,
        suffix: document.getElementById('edit_suffix').value,
        date_of_birth: document.getElementById('edit_date_of_birth').value,
        gender: document.getElementById('edit_gender').value,
        email: document.getElementById('edit_email').value,
        phone_number: document.getElementById('edit_phone_number').value,
        street: document.getElementById('edit_street').value,
        barangay: document.getElementById('edit_barangay').value,
        city: document.getElementById('edit_city').value,
        province: document.getElementById('edit_province').value,
        zip_code: document.getElementById('edit_zip_code').value,
        guardian_name: document.getElementById('edit_guardian_name').value,
        guardian_relationship: document.getElementById('edit_guardian_relationship').value,
        guardian_phone: document.getElementById('edit_guardian_phone').value,
        guardian_email: document.getElementById('edit_guardian_email').value,
        school_level: document.getElementById('edit_school_level').value,
        grade_level: document.getElementById('edit_grade_level').value,
        strand: document.getElementById('edit_strand').value || null,
        previous_school: document.getElementById('edit_previous_school').value,
        application_type: document.getElementById('edit_application_type').value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/admission/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
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

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Click outside to close edit modal
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

function openNewApplicationModal() {
  const modal = document.getElementById('newApplicationModal');
  modal.style.display = 'block';
  setTimeout(() => modal.classList.add('active'), 10);
  clearNewApplicationForm();
}

function closeNewApplicationModal() {
  const modal = document.getElementById('newApplicationModal');
  modal.classList.remove('active');
  setTimeout(() => modal.style.display = 'none', 300);
}

function clearNewApplicationForm() {
  document.getElementById('newApplicationForm').reset();
  document.getElementById('new_strand_group').style.display = 'none';
  document.getElementById('new_strand').removeAttribute('required');
  const gradeSelect = document.getElementById('new_grade_level');
  gradeSelect.innerHTML = '<option value="">Select Grade</option>';
}

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
  } else {
    strandGroup.style.display = 'none';
    strandSelect.removeAttribute('required');
  }
}

async function submitNewApplication() {
  const form = document.getElementById('newApplicationForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const token = localStorage.getItem('token');
  const newAppData = {
    lrn: document.getElementById('new_student_number').value || null,
    studentnumber: document.getElementById('new_student_number').value || null,
    first_name: document.getElementById('new_first_name').value,
    middle_name: document.getElementById('new_middle_name').value,
    last_name: document.getElementById('new_last_name').value,
    suffix: document.getElementById('new_suffix').value,
    date_of_birth: document.getElementById('new_date_of_birth').value,
    gender: document.getElementById('new_gender').value,
    email: document.getElementById('new_email').value,
    phone_number: document.getElementById('new_phone_number').value,
    street: document.getElementById('new_street').value,
    barangay: document.getElementById('new_barangay').value,
    city: document.getElementById('new_city').value,
    province: document.getElementById('new_province').value,
    zip_code: document.getElementById('new_zip_code').value,
    guardian_name: document.getElementById('new_guardian_name').value,
    guardian_relationship: document.getElementById('new_guardian_relationship').value,
    guardian_phone: document.getElementById('new_guardian_phone').value,
    guardian_email: document.getElementById('new_guardian_email').value,
    school_level: document.getElementById('new_school_level').value,
    grade_level: document.getElementById('new_grade_level').value,
    strand: document.getElementById('new_strand').value || null,
    previous_school: document.getElementById('new_previous_school').value,
    application_type: document.getElementById('new_application_type').value,
  };

  try {
    const response = await fetch('http://localhost:3000/api/admission/submit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAppData)
    });

    const data = await response.json();
    if (response.ok && data.success) {
      alert('Application submitted successfully!');
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

// Allow click outside to close
document.getElementById('newApplicationModal').addEventListener('click', function(e) {
  if (e.target === this) closeNewApplicationModal();
});

function addGuardian() {
  const container = document.getElementById('guardiansContainer');
  const guardianBlock = document.createElement('div');
  guardianBlock.classList.add('guardian-block');
  guardianBlock.innerHTML = `
    <div class="form-group">
      <label>Guardian Name *</label><input type="text" class="guardian-name" required>
    </div>
    <div class="form-group">
      <label>Relationship *</label>
      <select class="guardian-relationship" required>
        <option value="">Select Relationship</option>
        <option value="Mother">Mother</option>
        <option value="Father">Father</option>
        <option value="Grandparent">Grandparent</option>
        <option value="Aunt/Uncle">Aunt/Uncle</option>
        <option value="Sibling">Sibling</option>
        <option value="Legal Guardian">Legal Guardian</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div class="form-group">
      <label>Guardian Phone *</label><input type="tel" class="guardian-phone" required>
    </div>
    <div class="form-group">
      <label>Guardian Email</label><input type="email" class="guardian-email">
    </div>
    <button type="button" class="remove-guardian" onclick="removeGuardian(this)">Remove</button>
    <hr>
  `;
  container.appendChild(guardianBlock);
}

function removeGuardian(btn) {
  btn.parentElement.remove();
}

// To initialize, call addGuardian() once when the form is loaded for the initial block

function getGuardians() {
  const guardians = [];
  document.querySelectorAll('.guardian-block').forEach(block => {
    guardians.push({
      name: block.querySelector('.guardian-name').value,
      relationship: block.querySelector('.guardian-relationship').value,
      phone: block.querySelector('.guardian-phone').value,
      email: block.querySelector('.guardian-email').value
    });
  });
  return guardians;
}

// In submitNewApplication, use
const guardiansArray = getGuardians();
// Then add to your payload:
newAppData.guardians = guardiansArray;


loadApplications();