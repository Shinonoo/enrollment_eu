const urlParams = new URLSearchParams(window.location.search);
const paymentRecordId = urlParams.get('id');
const token = localStorage.getItem('token');

if (!paymentRecordId || !token) {
    alert('Invalid access. Missing payment record or authentication.');
    window.close();
}

// Load registration data on page load
document.addEventListener('DOMContentLoaded', loadRegistrationData);

async function loadRegistrationData() {
    try {
        const response = await fetch(`http://localhost:3000/api/payments/registration/${paymentRecordId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load registration data');
        }

        populateForm(data.registration);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('registrationForm').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading registration:', error);
        document.getElementById('loading').innerHTML = `
            <p style="color: #DC2626;">❌ Error loading registration form</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Close Window</button>
        `;
    }
}

function populateForm(data) {
    // Set current dates
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
    });
    
    document.getElementById('currentDate').textContent = formattedDate;
    document.getElementById('generatedDate').textContent = today.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('registeredDate').textContent = formattedDate;

    // Form number (use payment_record_id padded)
    document.getElementById('formNumber').textContent = String(data.payment_record_id).padStart(4, '0');

    // School year
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    document.getElementById('schoolYear').textContent = `${currentYear}-${nextYear}`;
    document.getElementById('academicYear').textContent = `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

    // Student Information
    const fullName = `${data.last_name}, ${data.first_name} ${data.middle_name || ''} ${data.suffix || ''}`.trim();
    document.getElementById('studentId').textContent = data.application_id || 'PENDING';
    document.getElementById('studentName').textContent = fullName;
    document.getElementById('oathName').textContent = fullName;
    document.getElementById('consentName').textContent = fullName;
    
    // Course/Level info
    const courseLevel = data.strand 
        ? `${data.school_level} - Grade ${data.grade_level} (${data.strand})`
        : `${data.school_level} - Grade ${data.grade_level}`;
    
    document.getElementById('courseMajor').textContent = courseLevel;
    document.getElementById('yearLevel').textContent = `Grade ${data.grade_level}`;

    // Populate Subjects (if available - for now we'll show placeholder)
    populateSubjects(data);

    // Populate Fees
    populateFees(data);

    // Assessment Information
    populateAssessment(data);
}

function populateSubjects(data) {
    const subjectsBody = document.getElementById('subjectsBody');
    subjectsBody.innerHTML = '';

    // Since we don't have subject data yet, show placeholder
    const placeholderRow = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                <em>Subject enrollment will be assigned by the registrar after confirmation.</em>
            </td>
        </tr>
    `;
    
    subjectsBody.innerHTML = placeholderRow;
    document.getElementById('totalUnits').textContent = '0';
}

function populateFees(data) {
    const feesBody = document.getElementById('feesBody');
    feesBody.innerHTML = '';

    // Parse payment scheme details
    let schemeDetails = {};
    try {
        schemeDetails = JSON.parse(data.scheme_details || '{}');
    } catch (e) {
        console.error('Error parsing scheme details:', e);
    }

    const fees = [
        { name: 'TUITION FEE', amount: parseFloat(data.tuition_fee || 0) },
        { name: 'MISCELLANEOUS FEE', amount: parseFloat(schemeDetails.miscellaneous_fee || 0) },
        { name: 'REGISTRATION FEE', amount: parseFloat(schemeDetails.registration_fee || 0) },
        { name: 'ID FEE', amount: parseFloat(schemeDetails.id_fee || 0) },
        { name: 'LIBRARY FEE', amount: parseFloat(schemeDetails.library_fee || 0) },
        { name: 'LABORATORY FEE', amount: parseFloat(schemeDetails.laboratory_fee || 0) },
        { name: 'COMPUTER FEE', amount: parseFloat(schemeDetails.computer_fee || 0) },
        { name: 'ATHLETIC FEE', amount: parseFloat(schemeDetails.athletic_fee || 0) }
    ];

    let totalMiscFees = 0;
    let row = '';
    
    for (let i = 0; i < fees.length; i += 2) {
        row += '<tr>';
        
        // First fee
        row += `<td>${fees[i].name}</td>`;
        row += `<td style="text-align: right;">${fees[i].amount.toFixed(2)}</td>`;
        totalMiscFees += fees[i].amount;
        
        // Second fee (if exists)
        if (fees[i + 1]) {
            row += `<td>${fees[i + 1].name}</td>`;
            row += `<td style="text-align: right;">${fees[i + 1].amount.toFixed(2)}</td>`;
            totalMiscFees += fees[i + 1].amount;
        } else {
            row += '<td></td><td></td>';
        }
        
        row += '</tr>';
    }

    feesBody.innerHTML = row;
    document.getElementById('totalMiscFees').textContent = totalMiscFees.toFixed(2);
}

function populateAssessment(data) {
    const totalAmount = parseFloat(data.total_amount || 0);
    const amountPaid = parseFloat(data.amount_paid || 0);
    const balance = totalAmount - amountPaid;

    // Parse payment scheme details
    let schemeDetails = {};
    try {
        schemeDetails = JSON.parse(data.scheme_details || '{}');
    } catch (e) {
        console.error('Error parsing scheme details:', e);
    }

    const tuitionFee = parseFloat(data.tuition_fee || 0);
    const miscFee = totalAmount - tuitionFee;

    // Tuition rate (per unit - if available)
    const tuitionRate = schemeDetails.tuition_rate || '0.00';
    document.getElementById('tuitionRate').textContent = tuitionRate;

    // Mode of payment
    const paymentMode = data.scheme_name || 'N/A';
    document.getElementById('modeOfPayment').textContent = paymentMode;

    // Payment scheme breakdown
    const downPayment = parseFloat(schemeDetails.down_payment || amountPaid);
    const monthlyPayment = parseFloat(schemeDetails.monthly_installment || 0);
    
    document.getElementById('downPayment').textContent = formatCurrency(downPayment);
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);

    // Fees
    document.getElementById('tuitionFee').textContent = formatCurrency(tuitionFee);
    document.getElementById('miscFee').textContent = formatCurrency(miscFee);
    document.getElementById('labFee').textContent = formatCurrency(schemeDetails.laboratory_fee || 0);
    document.getElementById('labDeposit').textContent = '0.00';
    document.getElementById('tuitionDiscount').textContent = '0.00';

    // Down payment deduction
    document.getElementById('downPaymentDeduct').textContent = formatCurrency(amountPaid);

    // Total assessment and balance
    document.getElementById('totalAssessment').textContent = formatCurrency(totalAmount);
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
}

function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function confirmEnrollment() {
    const confirmation = confirm(
        'Are you sure you want to confirm enrollment?\n\n' +
        'This will finalize the student\'s enrollment and assign a student number.\n\n' +
        'This action cannot be undone.'
    );

    if (!confirmation) return;

    try {
        const response = await fetch('http://localhost:3000/api/payments/enroll', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentRecordId })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to confirm enrollment');
        }

        alert(
            '✅ ENROLLMENT CONFIRMED!\n\n' +
            `Student Number: ${data.studentNumber}\n\n` +
            'The student is now officially enrolled in the system.'
        );

        // Close window and refresh parent
        if (window.opener) {
            window.opener.loadStudents?.();
        }
        window.close();

    } catch (error) {
        console.error('Error confirming enrollment:', error);
        alert('❌ Error: ' + error.message);
    }
}
