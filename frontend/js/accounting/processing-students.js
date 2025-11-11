const token = localStorage.getItem('token');
if (!token) window.location.href = '/pages/public/login.html';

let currentStudentData = null;

async function loadStudents() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('studentsGrid').classList.add('hidden');

    try {
        const response = await fetch('http://localhost:3000/api/payments/processing', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        document.getElementById('loading').style.display = 'none';

        if (response.ok && data.success) {
            if (data.students.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayStudents(data.students);
            }
        } else {
            alert('Failed to load students');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Connection error');
    }
}

function displayStudents(students) {
    const grid = document.getElementById('studentsGrid');
    grid.innerHTML = '';

    students.forEach(student => {
        const total = parseFloat(student.total_amount);
        const paid = parseFloat(student.amount_paid);
        const balance = total - paid;
        
        const fullName = `${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`.trim();
        const level = student.strand 
            ? `${student.school_level} - Grade ${student.grade_level} (${student.strand})`
            : `${student.school_level} - Grade ${student.grade_level}`;

        const card = document.createElement('div');
        card.className = 'student-card';
        
        // Store student data for modal
        const studentData = JSON.stringify(student).replace(/"/g, '&quot;');
        
        card.innerHTML = `
            <div class="student-header">
                <div>
                    <div class="student-name">${fullName}</div>
                    <div class="student-level">${level}</div>
                </div>
                <span class="badge badge-processing">Processing</span>
            </div>

            <div class="student-info">
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${student.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${student.phone_number}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Guardian:</span>
                    <span class="info-value">${student.guardian_name}</span>
                </div>
            </div>

            <div class="payment-summary">
                <h4>Payment Summary</h4>
                <div class="payment-row">
                    <span class="payment-label">Total Amount:</span>
                    <span class="payment-amount">₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Amount Paid:</span>
                    <span class="payment-amount">₱${paid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Balance:</span>
                    <span class="payment-amount balance">₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div class="card-actions">
                <button onclick='showPrintConfirmation(${studentData})' 
                    class="btn btn-primary">
                    🖨️ Print & Enroll
                </button>
                <button onclick="viewPaymentHistory(${student.payment_record_id})" 
                    class="btn btn-secondary">
                    📜 History
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    grid.classList.remove('hidden');
}

function showPrintConfirmation(student) {
    currentStudentData = student;
    const fullName = `${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`.trim();
    const level = student.strand 
        ? `${student.school_level} - Grade ${student.grade_level} (${student.strand})`
        : `${student.school_level} - Grade ${student.grade_level}`;
    
    document.getElementById('confirmStudentName').textContent = fullName;
    document.getElementById('confirmStudentLevel').textContent = level;
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    currentStudentData = null;
}

function confirmPrint() {
    if (currentStudentData) {
        printRegistrationForm(currentStudentData.payment_record_id);
        closeConfirmModal();
    }
}

function printRegistrationForm(paymentRecordId) {
    const printWindow = window.open(
        `/pages/accounting/registration-form.html?id=${paymentRecordId}`, 
        '_blank',
        'width=900,height=800'
    );
}

async function enrollStudent(paymentRecordId, studentName) {
    try {
        const response = await fetch('http://localhost:3000/api/payments/enroll', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentRecordId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ ${studentName} enrolled successfully!\n\nStudent Number: ${data.studentNumber}\n\nThe student is now in the system.`);
            loadStudents();
        } else {
            alert('❌ ' + (data.message || 'Failed to enroll student'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
}

function viewPaymentHistory(paymentRecordId) {
    alert(`Payment history for record ${paymentRecordId}\n\nFeature coming soon!`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/pages/public/login.html';
    }
}

// Close modal when clicking outside
document.getElementById('confirmModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeConfirmModal();
    }
});

// Load students on page load
loadStudents();
