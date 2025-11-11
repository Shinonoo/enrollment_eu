const token = localStorage.getItem('token');
if (!token) window.location.href = '/pages/public/login.html';

let currentPayment = null;

async function loadPayments() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('paymentsTable').style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/api/payments/pending', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        document.getElementById('loading').style.display = 'none';

        if (response.ok && data.success) {
            if (data.payments.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayPayments(data.payments);
            }
        } else {
            alert('Failed to load payments');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Connection error');
    }
}

function displayPayments(payments) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    payments.forEach(payment => {
        const row = document.createElement('tr');
        const total = parseFloat(payment.total_amount);
        const paid = parseFloat(payment.amount_paid);
        const balance = total - paid;
        const downPayment = parseFloat(payment.upon_enrollment || 0);
        const installmentCount = parseInt(payment.installment_count || 1);
        
        // Determine if minimum payment requirement is met
        let hasMetMinimum = false;
        let requiredAmount = downPayment;
        let paymentType = 'installment';
        
        if (installmentCount === 1 && downPayment === 0) {
            paymentType = 'cash';
            requiredAmount = total;
            hasMetMinimum = paid >= total;
        } else {
            paymentType = 'installment';
            requiredAmount = downPayment;
            hasMetMinimum = paid >= downPayment && downPayment > 0;
        }
        
        const hasPaid = paid > 0;
        
        row.innerHTML = `
            <td><strong>${payment.first_name} ${payment.last_name}</strong></td>
            <td>${payment.school_level} - Grade ${payment.grade_level}</td>
            <td>${payment.scheme_name || 'N/A'}</td>
            <td>₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            <td>₱${paid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            <td><strong>₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
            <td><span class="badge badge-${payment.payment_status}">${payment.payment_status}</span></td>
            <td></td>
        `;

        const actionCell = row.querySelector('td:last-child');
        
        // Create container div for buttons
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-buttons';
        console.log('Creating action container for:', payment.first_name); // ADD THIS
        

        // Record Payment button
        const recordBtn = document.createElement('button');
        recordBtn.className = 'btn btn-primary btn-sm';
        recordBtn.textContent = 'Record Payment';
        recordBtn.onclick = () => openPaymentModal(payment);
        actionContainer.appendChild(recordBtn);

        // View History button (if they have any payments)
        if (paid > 0) {
            const historyBtn = document.createElement('button');
            historyBtn.className = 'btn btn-secondary btn-sm';
            historyBtn.textContent = '📋 History';
            historyBtn.onclick = () => viewPaymentHistory(payment.payment_record_id);
            actionContainer.appendChild(historyBtn);
        }

        // Send to Accounting button (only show if requirements are met)
        if (hasMetMinimum) {
            const sendBtn = document.createElement('button');
            sendBtn.className = 'btn btn-success btn-sm';
            sendBtn.textContent = '✓ Send to Accounting';
            sendBtn.onclick = () => sendToAccounting(payment);
            actionContainer.appendChild(sendBtn);
        } else if (hasPaid && !hasMetMinimum) {
            // Show info if they paid but not enough
            const remaining = requiredAmount - paid;
            const infoSpan = document.createElement('span');
            infoSpan.className = 'action-info';
            infoSpan.textContent = paymentType === 'cash' 
                ? `Full payment required: ₱${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })} more`
                : `Need ₱${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })} more for down payment`;
            actionContainer.appendChild(infoSpan);
        } else {
            // No payment yet
            const infoSpan = document.createElement('span');
            infoSpan.className = 'action-info no-payment';
            infoSpan.textContent = paymentType === 'cash'
                ? `Full payment: ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                : `Down payment: ₱${downPayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
            actionContainer.appendChild(infoSpan);
        }

        // Append container to action cell
        actionCell.appendChild(actionContainer);
        tbody.appendChild(row);
    });

    document.getElementById('paymentsTable').style.display = 'table';
}

async function openPaymentModal(payment) {
    currentPayment = payment;
    const total = parseFloat(payment.total_amount);
    const paid = parseFloat(payment.amount_paid);
    const balance = total - paid;

    document.getElementById('paymentInfo').innerHTML = `
        <p><strong>Student:</strong> ${payment.first_name} ${payment.last_name}</p>
        <p><strong>Total Amount:</strong> ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
        <p><strong>Amount Paid:</strong> ₱${paid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
        <p><strong>Balance:</strong> ₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
    `;

    document.getElementById('paymentRecordId').value = payment.payment_record_id;
    document.getElementById('amount').max = balance.toFixed(2);
    document.getElementById('successMsg').classList.add('hidden');

    await loadSchemeDetails(payment);

    document.getElementById('paymentModal').style.display = 'block';
}

async function loadSchemeDetails(payment) {
    const breakdownDiv = document.getElementById('schemeBreakdown');
    const detailsDiv = document.getElementById('schemeDetails');
    
    try {
        const response = await fetch(`http://localhost:3000/api/payments/scheme-details/${payment.payment_record_id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            breakdownDiv.style.display = 'none';
            return;
        }

        const data = await response.json();
        if (!data.success || !data.scheme) {
            breakdownDiv.style.display = 'none';
            return;
        }

        const scheme = data.scheme;
        const uponEnrollment = parseFloat(scheme.upon_enrollment || 0);
        const installmentCount = parseInt(scheme.installment_count || 1);
        const installmentAmount = parseFloat(scheme.installment_amount || 0);
        const totalAmount = parseFloat(scheme.total_amount);
        const isCustom = scheme.is_custom_payment === 1;

        breakdownDiv.style.display = 'block';
        detailsDiv.innerHTML = '';

        let html = `
            <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; margin-top: 0.5rem;">
                <h5 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #6b7280;">
                    ${scheme.scheme_name}
                    ${isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-left: 0.5rem;">⚠️ Custom</span>' : ''}
                </h5>
        `;

        if (uponEnrollment > 0) {
            html += `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Down Payment:</span>
                    <strong>₱${uponEnrollment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                </div>
            `;
        }

        if (installmentCount > 1 || (installmentCount === 1 && uponEnrollment === 0)) {
            html += `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Monthly Payment:</span>
                    <strong>₱${installmentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} × ${installmentCount}</strong>
                </div>
            `;
        }

        html += `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; margin-top: 0.5rem; border-top: 2px solid #8b0000;">
                <span style="font-weight: 600;">Total Amount:</span>
                <strong style="color: #8b0000; font-size: 1.125rem;">₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
            </div>
        `;

        if (isCustom && scheme.custom_reason) {
            html += `
                <div style="margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0.25rem;">
                    <p style="margin: 0; font-size: 0.75rem; color: #92400e;"><strong>Reason:</strong> ${scheme.custom_reason}</p>
                </div>
            `;
        }

        html += '</div>';
        detailsDiv.innerHTML = html;

        detailsDiv.style.maxHeight = '0';
        detailsDiv.style.overflow = 'hidden';
        document.getElementById('toggleSchemeBtn').innerHTML = '▼ Show Details';

    } catch (error) {
        console.error('Error loading scheme:', error);
        breakdownDiv.style.display = 'none';
    }
}

function toggleSchemeBreakdown() {
    const details = document.getElementById('schemeDetails');
    const btn = document.getElementById('toggleSchemeBtn');
    
    if (details.style.maxHeight === '0px' || !details.style.maxHeight) {
        const height = details.scrollHeight;
        details.style.maxHeight = `${height}px`;
        details.style.overflow = 'visible';
        btn.innerHTML = '▲ Hide Details';
    } else {
        details.style.maxHeight = '0';
        details.style.overflow = 'hidden';
        btn.innerHTML = '▼ Show Details';
    }
}

async function submitPayment() {
    const paymentRecordId = document.getElementById('paymentRecordId');
    const amount = document.getElementById('amount');
    const paymentMethod = document.getElementById('paymentMethod');
    const referenceNumber = document.getElementById('referenceNumber');
    const notes = document.getElementById('notes');

    if (!paymentRecordId || !amount || !paymentMethod) {
        console.error('Required form elements not found');
        alert('Form error - please refresh the page');
        return;
    }

    const paymentData = {
        paymentRecordId: paymentRecordId.value,
        amount: parseFloat(amount.value),
        paymentMethod: paymentMethod.value,
        referenceNumber: referenceNumber ? referenceNumber.value : '',
        notes: notes ? notes.value : ''
    };

    if (!paymentData.amount || !paymentData.paymentMethod) {
        alert('Please fill in required fields');
        return;
    }

    const balanceText = currentPayment.total_amount - currentPayment.amount_paid;
    
    if (paymentData.amount > balanceText) {
        const overpayment = paymentData.amount - balanceText;
        if (!confirm(
            `Warning: Payment exceeds balance!\n\n` +
            `Balance: ₱${balanceText.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n` +
            `Payment: ₱${paymentData.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n` +
            `Overpayment: ₱${overpayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n\n` +
            `Continue anyway?`
        )) {
            return;
        }
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const response = await fetch('http://localhost:3000/api/payments/record', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const successMsg = document.getElementById('successMsg');
            successMsg.textContent = '✅ Payment recorded successfully!';
            successMsg.classList.remove('hidden');

            document.getElementById('paymentForm').reset();
            
            setTimeout(() => {
                closeModal();
                loadPayments();
            }, 1500);
        } else {
            alert(data.message || 'Failed to record payment');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Record Payment';
    }
}

async function sendToAccounting(payment) {
    const total = parseFloat(payment.total_amount);
    const paid = parseFloat(payment.amount_paid);
    const balance = total - paid;
    const downPayment = parseFloat(payment.upon_enrollment || 0);
    const installmentCount = parseInt(payment.installment_count || 1);

    let requiredAmount = downPayment;
    let paymentType = 'installment';
    
    if (installmentCount === 1 && downPayment === 0) {
        paymentType = 'cash';
        requiredAmount = total;
    }

    if (paid < requiredAmount) {
        const message = paymentType === 'cash'
            ? `Cannot send to accounting yet.\n\nThis is a CASH PAYMENT scheme.\nFull payment required: ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\nPaid so far: ₱${paid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\nStill need: ₱${(requiredAmount - paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
            : `Cannot send to accounting yet.\n\nMinimum required (Down Payment): ₱${requiredAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\nPaid so far: ₱${paid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\nStill need: ₱${(requiredAmount - paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
        
        alert(message);
        return;
    }

    const message = balance > 0 
        ? `Send ${payment.first_name} ${payment.last_name} to Accounting?\n\n✅ Down payment met: ₱${downPayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\nBalance remaining: ₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n\nAccounting will handle the remaining payment scheme.`
        : `Send ${payment.first_name} ${payment.last_name} to Accounting?\n\n✅ Payment is complete!`;

    if (!confirm(message)) return;

    try {
        const response = await fetch('http://localhost:3000/api/payments/send-to-accounting', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentRecordId: payment.payment_record_id
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Student sent to accounting successfully!');
            loadPayments();
        } else {
            alert('❌ ' + (data.message || 'Failed to send to accounting'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
}

function closeModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentForm').reset();
    document.getElementById('successMsg').classList.add('hidden');
}

document.getElementById('paymentModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

loadPayments();

async function viewPaymentHistory(paymentRecordId) {
    try {
        const response = await fetch(`http://localhost:3000/api/payments/history/${paymentRecordId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayPaymentHistory(data.transactions);
            document.getElementById('historyModal').style.display = 'block';
        } else {
            alert('Failed to load payment history');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

function displayPaymentHistory(transactions) {
    const content = document.getElementById('historyContent');
    
    if (transactions.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #6b7280;">No payment history yet</p>';
        return;
    }

    let html = '<table class="table" style="margin-top: 1rem;"><thead><tr>';
    html += '<th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Cashier</th><th>Action</th>';
    html += '</tr></thead><tbody>';

    transactions.forEach((tx, index) => {
        const date = new Date(tx.transaction_date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        html += `<tr>
            <td>${date}</td>
            <td><strong>₱${parseFloat(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
            <td><span class="badge">${tx.payment_method.toUpperCase()}</span></td>
            <td>${tx.reference_number || '-'}</td>
            <td>${tx.cashier_name || 'N/A'}</td>
            <td>
                ${index === 0 ? `<button onclick="voidTransaction(${tx.transaction_id})" class="btn btn-danger btn-sm">❌ Void</button>` : '-'}
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    content.innerHTML = html;
}

async function voidTransaction(transactionId) {
    if (!confirm('⚠️ Void this transaction?\n\nThis will remove this payment from the record. This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/payments/void/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Transaction voided successfully');
            closeHistoryModal();
            loadPayments();
        } else {
            alert('❌ ' + (data.message || 'Failed to void transaction'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error');
    }
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}

document.getElementById('historyModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeHistoryModal();
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/pages/public/login.html';
    }
}
