// ============================================
// ADMISSION RETURNING STUDENT JAVASCRIPT
// ============================================

// Mock database - Replace with actual API calls
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
// LOOKUP STUDENT
// ============================================

function lookupStudent() {
    const studentId = document.getElementById('studentId').value.trim();
    
    if (!studentId) {
        showToast('Please enter your Student ID', 'error');
        return;
    }
    
    // Mock API call - Replace with actual fetch
    setTimeout(() => {
        const student = MOCK_STUDENTS[studentId];
        
        if (student) {
            displayStudentInfo(student, studentId);
            showToast('Student found successfully!', 'success');
        } else {
            showToast('Student ID not found. Please check and try again.', 'error');
        }
    }, 500);
}

// ============================================
// DISPLAY STUDENT INFO
// ============================================

function displayStudentInfo(student, studentId) {
    const studentDetails = document.getElementById('studentDetails');
    const studentInfoSection = document.getElementById('studentInfoSection');
    
    // Display student information
    studentDetails.innerHTML = `
        <div style="color: var(--gray-700); line-height: 2;">
            <p><strong>Student ID:</strong> ${studentId}</p>
            <p><strong>Name:</strong> ${student.firstName} ${student.middleName} ${student.lastName}</p>
            <p><strong>Current Grade:</strong> ${student.currentGrade}</p>
            ${student.currentStrand ? `<p><strong>Current Strand:</strong> ${student.currentStrand}</p>` : ''}
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
        </div>
    `;
    
    // Show the section
    studentInfoSection.classList.remove('hidden');
    
    // Populate grade level dropdown
    populateGradeLevels(student.currentGrade);
    
    // Pre-fill contact info
    document.getElementById('email').placeholder = student.email;
    document.getElementById('phoneNumber').placeholder = student.phone;
    
    // Enable form fields
    document.getElementById('newGradeLevel').disabled = false;
}

// ============================================
// POPULATE GRADE LEVELS
// ============================================

function populateGradeLevels(currentGrade) {
    const gradeSelect = document.getElementById('newGradeLevel');
    const strandGroup = document.getElementById('newStrandGroup');
    const strandSelect = document.getElementById('newStrand');
    
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
    }
    
    // Handle strand for Grade 11
    gradeSelect.addEventListener('change', function() {
        if (this.value === 'Grade 11') {
            strandGroup.classList.remove('hidden');
            strandSelect.disabled = false;
            strandSelect.required = true;
        } else {
            strandGroup.classList.add('hidden');
            strandSelect.disabled = true;
            strandSelect.required = false;
        }
    });
}

// ============================================
// FORM SUBMISSION
// ============================================

document.getElementById('returningStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        studentId: document.getElementById('studentId').value,
        newGradeLevel: document.getElementById('newGradeLevel').value,
        newStrand: document.getElementById('newStrand').value || null,
        email: document.getElementById('email').value || null,
        phoneNumber: document.getElementById('phoneNumber').value || null,
        agreeTerms: document.querySelector('input[name="agreeTerms"]').checked
    };
    
    if (!formData.agreeTerms) {
        showToast('Please confirm the agreement to proceed', 'error');
        return;
    }
    
    // Mock API submission
    console.log('Submitting re-enrollment:', formData);
    
    // Generate reference number
    const referenceNumber = 'RE-' + Date.now();
    
    // Show success message
    document.getElementById('referenceNumber').textContent = referenceNumber;
    document.getElementById('successMessage').classList.remove('hidden');
    
    // TODO: Replace with actual API call
    // fetch('/api/returning-student/enroll', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
