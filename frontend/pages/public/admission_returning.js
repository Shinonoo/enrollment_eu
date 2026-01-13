// ============================================
// ADMISSION RETURNING STUDENT JAVASCRIPT
// Manuel S. Enverga University Foundation Inc.
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:5001/api',
    TOAST_DURATION: 3000
};

// ============================================
// MOCK DATABASE - Replace with actual API calls
// ============================================

const MOCK_STUDENTS = {
    '2023-00001': {
        firstName: 'Juan',
        middleName: 'Santos',
        lastName: 'Dela Cruz',
        currentGrade: 'Grade 7',
        currentStrand: null,
        email: 'juan.delacruz@example.com',
        phone: '09123456789'
    },
    '2024-00001': {
        firstName: 'Maria',
        middleName: 'Garcia',
        lastName: 'Reyes',
        currentGrade: 'Grade 11',
        currentStrand: 'STEM',
        email: 'maria.reyes@example.com',
        phone: '09987654321'
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    if (!container) {
        console.error('Toast container not found');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { 
        success: '✓', 
        error: '✕', 
        warning: '⚠', 
        info: 'ℹ' 
    };
    
    toast.innerHTML = `
        <span style="font-size: 1.2rem; font-weight: bold;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alert');
    
    if (!alertDiv) {
        console.error('Alert element not found');
        return;
    }
    
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAlert() {
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
        alertDiv.classList.add('hidden');
    }
}

// ============================================
// LOOKUP STUDENT
// ============================================

function lookupStudent() {
    const studentId = document.getElementById('studentId').value.trim();
    
    if (!studentId) {
        showAlert('Please enter your Student ID', 'warning');
        showToast('Please enter your Student ID', 'error');
        return;
    }
    
    hideAlert();
    
    // Show loading state
    const lookupBtn = document.querySelector('button[onclick="lookupStudent()"]');
    const originalText = lookupBtn.textContent;
    lookupBtn.textContent = '🔍 Searching...';
    lookupBtn.disabled = true;
    
    // Mock API call - Replace with actual fetch
    setTimeout(() => {
        const student = MOCK_STUDENTS[studentId];
        
        lookupBtn.textContent = originalText;
        lookupBtn.disabled = false;
        
        if (student) {
            displayStudentInfo(student, studentId);
            showToast('Student found successfully!', 'success');
        } else {
            showAlert('Student ID not found. Please check and try again or contact the registrar.', 'error');
            showToast('Student ID not found', 'error');
            
            // Hide student info if previously shown
            const studentInfoSection = document.getElementById('studentInfoSection');
            if (studentInfoSection) {
                studentInfoSection.classList.add('hidden');
            }
        }
    }, 800);
}

// ============================================
// DISPLAY STUDENT INFO
// ============================================

function displayStudentInfo(student, studentId) {
    const studentDetails = document.getElementById('studentDetails');
    const studentInfoSection = document.getElementById('studentInfoSection');
    
    if (!studentDetails || !studentInfoSection) {
        console.error('Student details elements not found');
        return;
    }
    
    // Display student information with better styling
    studentDetails.innerHTML = `
        <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--secondary);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; color: var(--gray-700); line-height: 2;">
                <div>
                    <p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Student ID:</strong><br>${studentId}</p>
                    <p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Name:</strong><br>${student.firstName} ${student.middleName} ${student.lastName}</p>
                    <p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Current Grade:</strong><br>${student.currentGrade}</p>
                </div>
                <div>
                    ${student.currentStrand ? `<p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Current Strand:</strong><br>${student.currentStrand}</p>` : ''}
                    <p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Email:</strong><br>${student.email}</p>
                    <p style="margin-bottom: 0.75rem;"><strong style="color: var(--primary);">Phone:</strong><br>${student.phone}</p>
                </div>
            </div>
        </div>
    `;
    
    // Show the section with animation
    studentInfoSection.classList.remove('hidden');
    studentInfoSection.style.animation = 'fadeIn 0.5s ease';
    
    // Populate grade level dropdown
    populateGradeLevels(student.currentGrade);
    
    // Pre-fill contact info as placeholders
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phoneNumber');
    
    if (emailInput) emailInput.placeholder = student.email;
    if (phoneInput) phoneInput.placeholder = student.phone;
    
    // Enable form fields
    const gradeSelect = document.getElementById('newGradeLevel');
    if (gradeSelect) {
        gradeSelect.disabled = false;
    }
}

// ============================================
// POPULATE GRADE LEVELS
// ============================================

function populateGradeLevels(currentGrade) {
    const gradeSelect = document.getElementById('newGradeLevel');
    const strandGroup = document.getElementById('newStrandGroup');
    const strandSelect = document.getElementById('newStrand');
    
    if (!gradeSelect) {
        console.error('Grade select element not found');
        return;
    }
    
    gradeSelect.innerHTML = '<option value="">Select grade level</option>';
    
    // Determine next grade
    const gradeMap = {
        'Grade 7': ['Grade 8'],
        'Grade 8': ['Grade 9'],
        'Grade 9': ['Grade 10'],
        'Grade 10': ['Grade 11'],
        'Grade 11': ['Grade 12'],
        'Grade 12': [] // Graduated
    };
    
    const nextGrades = gradeMap[currentGrade] || [];
    
    if (nextGrades.length === 0) {
        gradeSelect.innerHTML = '<option value="">You have completed Grade 12</option>';
        gradeSelect.disabled = true;
        showAlert('You have completed Grade 12. Please contact the registrar for college enrollment.', 'info');
        return;
    }
    
    nextGrades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });
    
    // Auto-select if only one option
    if (nextGrades.length === 1) {
        gradeSelect.value = nextGrades[0];
        
        // Trigger change event
        const event = new Event('change');
        gradeSelect.dispatchEvent(event);
    }
    
    // Handle strand for Grade 11
    gradeSelect.addEventListener('change', function() {
        if (!strandGroup || !strandSelect) return;
        
        if (this.value === 'Grade 11') {
            strandGroup.classList.remove('hidden');
            strandSelect.disabled = false;
            strandSelect.required = true;
        } else {
            strandGroup.classList.add('hidden');
            strandSelect.disabled = true;
            strandSelect.required = false;
            strandSelect.value = '';
        }
    });
}

// ============================================
// FORM SUBMISSION
// ============================================

function handleFormSubmit(e) {
    e.preventDefault();
    hideAlert();
    
    const formData = {
        studentId: document.getElementById('studentId').value,
        newGradeLevel: document.getElementById('newGradeLevel').value,
        newStrand: document.getElementById('newStrand').value || null,
        email: document.getElementById('email').value || null,
        phoneNumber: document.getElementById('phoneNumber').value || null,
        agreeTerms: document.querySelector('input[name="agreeTerms"]').checked
    };
    
    // Validation
    if (!formData.newGradeLevel) {
        showAlert('Please select the grade level you want to enroll in', 'warning');
        return;
    }
    
    if (!formData.agreeTerms) {
        showAlert('Please confirm the agreement to proceed', 'error');
        return;
    }
    
    if (formData.newGradeLevel === 'Grade 11' && !formData.newStrand) {
        showAlert('Please select a strand for Grade 11', 'warning');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Processing...';
    submitBtn.disabled = true;
    
    // Mock API submission
    console.log('Submitting re-enrollment:', formData);
    
    setTimeout(() => {
        // Generate reference number
        const referenceNumber = 'RE-' + Date.now();
        
        // Show success message
        document.getElementById('referenceNumber').textContent = referenceNumber;
        document.getElementById('successMessage').classList.remove('hidden');
        document.getElementById('returningStudentForm').style.display = 'none';
        
        showToast('Re-enrollment successful!', 'success');
        
        // Reset button (in case they want to submit another)
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
    
    // TODO: Replace with actual API call
    /*
    fetch(`${CONFIG.API_BASE}/returning-student/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('referenceNumber').textContent = data.referenceNumber;
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('returningStudentForm').style.display = 'none';
            showToast('Re-enrollment successful!', 'success');
        } else {
            showAlert(data.message || 'Submission failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Connection error. Please try again.', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
    */
}

// ============================================
// RESET FORM
// ============================================

function resetForm() {
    document.getElementById('returningStudentForm').reset();
    document.getElementById('returningStudentForm').style.display = 'block';
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('studentInfoSection').classList.add('hidden');
    
    const gradeSelect = document.getElementById('newGradeLevel');
    if (gradeSelect) {
        gradeSelect.disabled = true;
    }
    
    hideAlert();
    sessionStorage.removeItem('admissionTypeWarning');
    showToast('Form reset. You can submit another application.', 'info');
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

// ============================================
// CUSTOM MODAL FUNCTIONS
// ============================================

function showApplicationTypeModal() {
    const modal = document.getElementById('confirmModal');
    const badge = document.getElementById('modalTypeBadge');
    const description = document.getElementById('modalDescription');
    
    // For returning student page
    badge.textContent = 'RETURNING STUDENT';
    description.innerHTML = 
        'You are starting a <strong>RETURNING STUDENT</strong> application.<br>' +
        'This is for students who were previously enrolled at MSEUF.';
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function confirmApplicationType() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    sessionStorage.setItem('admissionTypeWarning', 'true');
    showToast('Application type confirmed. You may now proceed.', 'success');
}

function cancelApplicationType() {
    window.location.href = 'admission.html';
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // **UPDATED: Show custom modal instead of browser confirm**
    const hasShownWarning = sessionStorage.getItem('admissionTypeWarning');
    
    if (!hasShownWarning) {
        setTimeout(() => {
            showApplicationTypeModal(); // Use custom modal
        }, 500);
    }
    
    // Attach form submit handler
    const form = document.getElementById('returningStudentForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Enable Enter key on Student ID lookup
    const studentIdInput = document.getElementById('studentId');
    if (studentIdInput) {
        studentIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                lookupStudent();
            }
        });
    }
});
