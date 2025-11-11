// ============================================
// Configuration & State Management
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:3000/api',
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000
};

const STATE = {
    token: localStorage.getItem('token'),
    allApplications: [],
    filteredApplications: [],
    paymentSchemes: [],
    currentPage: 1,
    itemsPerPage: 25,
    sortField: null,
    sortOrder: 'asc',
    selectedIds: new Set(),
    debounceTimer: null,
    currentApplication: null
};

// Verify auth
if (!STATE.token) {
    window.location.href = '/pages/public/login.html';
}

// ============================================
// Utility Functions
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span>${icons[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function debounceFilter() {
    clearTimeout(STATE.debounceTimer);
    STATE.debounceTimer = setTimeout(() => applyFilters(), CONFIG.DEBOUNCE_DELAY);
}

function formatCurrency(value) {
    return parseFloat(value).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP'
    });
}

function updateInstallmentBreakdown() {
    const schemeSelect = document.getElementById('schemeId');
    const schemeOption = schemeSelect.options[schemeSelect.selectedIndex];
    
    const totalAmount = parseFloat(schemeOption?.dataset.amount || 0);
    const uponEnrollment = parseFloat(schemeOption?.dataset.uponEnrollment || 0);
    const installmentCount = parseInt(schemeOption?.dataset.installmentCount || 1);
    const installmentAmount = parseFloat(schemeOption?.dataset.installmentAmount || 0);
    
    const breakdownDiv = document.getElementById('installmentBreakdown');
    const breakdownList = document.getElementById('breakdownList');

    // Mirror total amount field for consistency
    document.getElementById('totalAmount').value = totalAmount
        ? formatCurrency(totalAmount)
        : '';

    if (!totalAmount) {
        breakdownDiv.style.display = 'none';
        breakdownList.innerHTML = '';
        return;
    }

    breakdownDiv.style.display = 'block';
    breakdownList.innerHTML = '';

    let installments = [];

    // Check if it's a cash payment (only 1 installment and no down payment)
    if (installmentCount === 1 && uponEnrollment === 0) {
        installments = [{
            number: 1,
            label: 'Full Payment',
            amount: totalAmount,
            due: 'Upon Enrollment'
        }];
    } else {
        // Down payment first
        if (uponEnrollment > 0) {
            installments.push({
                number: 0,
                label: 'Down Payment',
                amount: uponEnrollment,
                due: 'Upon Enrollment'
            });
        }

        // Monthly installments
        for (let i = 1; i <= installmentCount; i++) {
            installments.push({
                number: i,
                label: `Monthly ${i}`,
                amount: installmentAmount,
                due: i === 1 ? 'Upon Enrollment' : `${i * 30} days after enrollment`
            });
        }
    }

    installments.forEach(inst => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `
            <div class="breakdown-number">
                <span class="installment-badge">${inst.number === 0 ? 'DP' : inst.number}</span>
            </div>
            <div class="breakdown-details">
                <div class="breakdown-label">${inst.label}</div>
                <div class="breakdown-due">${inst.due}</div>
            </div>
            <div class="breakdown-amount">${formatCurrency(inst.amount)}</div>
        `;
        breakdownList.appendChild(div);
    });

    // Reset to collapsed state
    breakdownList.classList.remove('expanded');
    breakdownList.style.maxHeight = '0';
    
    // Update button text
    const toggleBtn = document.getElementById('toggleBreakdownBtn');
    if (toggleBtn) {
        toggleBtn.innerHTML = '▼ Show Breakdown';
    }
}

function toggleBreakdown() {
    const breakdownList = document.getElementById('breakdownList');
    const toggleBtn = document.getElementById('toggleBreakdownBtn');
    
    if (breakdownList.classList.contains('expanded')) {
        // Collapsing
        breakdownList.classList.remove('expanded');
        breakdownList.style.maxHeight = '0';
        toggleBtn.innerHTML = '▼ Show Breakdown';
    } else {
        // Expanding
        breakdownList.classList.add('expanded');
        const contentHeight = breakdownList.scrollHeight;
        breakdownList.style.maxHeight = `${contentHeight}px`;
        toggleBtn.innerHTML = '▲ Hide Details';
    }
}


function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ============================================
// API Calls
// ============================================

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${STATE.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// ============================================
// Data Loading
// ============================================

async function loadApplications() {
    try {
        showLoadingState(true);
        const data = await fetchAPI('/payments/applications');

        STATE.allApplications = data.applications || [];
        STATE.filteredApplications = [...STATE.allApplications];
        STATE.currentPage = 1;

        updateStats();
        updateTable();
        showLoadingState(false);
    } catch (error) {
        showLoadingState(false);
    }
}

async function loadPaymentSchemes() {
    try {
        const data = await fetchAPI('/payments/schemes');
        STATE.paymentSchemes = data.schemes || [];
    } catch (error) {
        console.error('Failed to load schemes:', error);
    }
}

async function loadApplicationDetails(applicationId) {
    try {
        return await fetchAPI(`/admission/${applicationId}`);
    } catch (error) {
        throw error;
    }
}

// ============================================
// UI State Management
// ============================================

function showLoadingState(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
    document.getElementById('tableWrapper').style.display = isLoading ? 'none' : '';
    document.getElementById('emptyState').classList.add('hidden');
}

function updateStats() {
    const total = STATE.allApplications.length;
    const assigned = STATE.allApplications.filter(a => a.payment_record_id !== null).length;
    const unassigned = total - assigned;

    document.getElementById('totalPending').textContent = total;
    document.getElementById('totalAssigned').textContent = assigned;
    document.getElementById('totalUnassigned').textContent = unassigned;
}

// ============================================
// Filtering & Sorting
// ============================================

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const level = document.getElementById('levelFilter').value;
    const grade = document.getElementById('gradeFilter').value;
    const status = document.getElementById('statusFilter').value;

    STATE.filteredApplications = STATE.allApplications.filter(app => {
        const matchSearch = !search ||
            app.first_name.toLowerCase().includes(search) ||
            app.last_name.toLowerCase().includes(search) ||
            app.application_id.toString().includes(search);

        const matchLevel = !level || app.school_level === level;
        const matchGrade = !grade || app.grade_level.toString() === grade;
        const matchStatus = !status ||
            (status === 'pending' && app.payment_record_id === null) ||
            (status === 'assigned' && app.payment_record_id !== null);

        return matchSearch && matchLevel && matchGrade && matchStatus;
    });

    STATE.currentPage = 1;
    updateTable();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('gradeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    STATE.filteredApplications = [...STATE.allApplications];
    STATE.currentPage = 1;
    updateTable();
}

function sortTable(field) {
    const ths = document.querySelectorAll('.table th.sortable');
    ths.forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });

    if (STATE.sortField === field) {
        STATE.sortOrder = STATE.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        STATE.sortField = field;
        STATE.sortOrder = 'asc';
    }

    STATE.filteredApplications.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'name') {
            aVal = `${a.first_name} ${a.last_name}`;
            bVal = `${b.first_name} ${b.last_name}`;
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return STATE.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return STATE.sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    document.querySelector(
        `.table th[data-field="${field}"]`
    )?.classList.add(`sorted-${STATE.sortOrder}`);

    STATE.currentPage = 1;
    updateTable();
}

// Attach sortable click handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            sortTable(th.dataset.field);
        });
    });
});

// ============================================
// Table Rendering
// ============================================

function updateTable() {
    const total = STATE.filteredApplications.length;

    if (total === 0) {
        document.getElementById('tableWrapper').style.display = 'none';
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('tableWrapper').style.display = '';
    document.getElementById('emptyState').classList.add('hidden');

    renderTableRows();
    renderPagination();
}

function renderTableRows() {
    const start = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const end = start + STATE.itemsPerPage;
    const pageData = STATE.filteredApplications.slice(start, end);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    pageData.forEach(app => {
        const row = document.createElement('tr');
        if (STATE.selectedIds.has(app.application_id)) {
            row.classList.add('selected');
        }

        const hasPayment = app.payment_record_id !== null;
        const statusBadge = hasPayment
            ? '<span class="badge badge-assigned">✓ Assigned</span>'
            : '<span class="badge badge-pending">⏳ Pending</span>';

        const actionBtn = !hasPayment
            ? `<button onclick="openPaymentModal(${app.application_id})" class="btn btn-primary btn-sm">Assign</button>`
            : '<span style="color: var(--primary);">✓ Done</span>';

        row.innerHTML = `
            <td class="checkbox-col">
                <input type="checkbox" 
                    ${STATE.selectedIds.has(app.application_id) ? 'checked' : ''}
                    onchange="toggleRowSelection(${app.application_id})">
            </td>
            <td><strong>#${app.application_id}</strong></td>
            <td>${app.first_name} ${app.last_name}</td>
            <td><span class="badge badge-${app.school_level.toLowerCase()}">${app.school_level}</span></td>
            <td>Grade ${app.grade_level}</td>
            <td>${formatDate(app.reviewed_at)}</td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        `;

        tbody.appendChild(row);
    });

    updatePaginationInfo();
}

function renderPagination() {
    const total = STATE.filteredApplications.length;
    const totalPages = Math.ceil(total / STATE.itemsPerPage);

    // Update buttons
    document.getElementById('prevBtn').disabled = STATE.currentPage === 1;
    document.getElementById('nextBtn').disabled = STATE.currentPage === totalPages;

    // Generate page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    const maxButtons = 5;
    let startPage = Math.max(1, STATE.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `page-btn ${i === STATE.currentPage ? 'active' : ''}`;
        btn.onclick = () => goToPage(i);
        pageNumbers.appendChild(btn);
    }
}

function updatePaginationInfo() {
    const total = STATE.filteredApplications.length;
    const start = (STATE.currentPage - 1) * STATE.itemsPerPage + 1;
    const end = Math.min(STATE.currentPage * STATE.itemsPerPage, total);

    document.getElementById('pageStart').textContent = start;
    document.getElementById('pageEnd').textContent = end;
    document.getElementById('pageTotal').textContent = total;
}

function nextPage() {
    const totalPages = Math.ceil(STATE.filteredApplications.length / STATE.itemsPerPage);
    if (STATE.currentPage < totalPages) {
        STATE.currentPage++;
        updateTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousPage() {
    if (STATE.currentPage > 1) {
        STATE.currentPage--;
        updateTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToPage(page) {
    STATE.currentPage = page;
    updateTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changeItemsPerPage() {
    STATE.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    STATE.currentPage = 1;
    updateTable();
}

// ============================================
// Row Selection & Bulk Actions
// ============================================

function toggleRowSelection(applicationId) {
    if (STATE.selectedIds.has(applicationId)) {
        STATE.selectedIds.delete(applicationId);
    } else {
        STATE.selectedIds.add(applicationId);
    }
    updateBulkActionUI();
    updateTableUI();
}

function toggleSelectAll() {
    const checkbox = document.getElementById('selectAll');
    const start = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const end = start + STATE.itemsPerPage;
    const pageData = STATE.filteredApplications.slice(start, end);

    if (checkbox.checked) {
        pageData.forEach(app => STATE.selectedIds.add(app.application_id));
    } else {
        pageData.forEach(app => STATE.selectedIds.delete(app.application_id));
    }

    updateBulkActionUI();
    updateTableUI();
}

function updateTableUI() {
    document.querySelectorAll('.table tbody tr').forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

function updateBulkActionUI() {
    const bulkActions = document.getElementById('bulkActions');
    const count = STATE.selectedIds.size;

    if (count > 0) {
        bulkActions.classList.remove('hidden');
        document.getElementById('bulkCount').textContent =
            `${count} selected`;
    } else {
        bulkActions.classList.add('hidden');
    }
}

function clearBulkSelection() {
    STATE.selectedIds.clear();
    document.getElementById('selectAll').checked = false;
    updateBulkActionUI();
    updateTableUI();
}

function refreshData() {
    loadApplications();
    showToast('Data refreshed', 'success');
}

// ============================================
// Modal Management
// ============================================

async function openPaymentModal(applicationId) {
    try {
        const data = await loadApplicationDetails(applicationId);
        const app = data.application;

        STATE.currentApplication = app;
        document.getElementById('applicationId').value = app.application_id;

        // Populate student info
        document.getElementById('studentInfo').innerHTML = `
            <p><strong>Name:</strong> ${app.first_name} ${app.middle_name || ''} ${app.last_name}</p>
            <p><strong>School Level:</strong> ${app.school_level} - Grade ${app.grade_level}</p>
            <p><strong>Application Type:</strong> ${app.application_type}</p>
            <p><strong>Email:</strong> ${app.email || 'N/A'}</p>
        `;

        // Populate schemes
        const select = document.getElementById('schemeId');
        select.innerHTML = '<option value="">Select payment scheme...</option>';

        const relevantSchemes = STATE.paymentSchemes.filter(s =>
            s.school_level === app.school_level &&
            s.grade_level === app.grade_level.toString()
        );

        if (relevantSchemes.length === 0) {
            showToast('No payment schemes available for this level/grade', 'warning');
            select.innerHTML += '<option disabled>No schemes available</option>';
        } else {
            relevantSchemes.forEach(scheme => {
                const option = document.createElement('option');
                option.value = scheme.scheme_id;
                option.textContent = `${scheme.scheme_name} - ${formatCurrency(scheme.total_amount)}`;
                option.dataset.amount = scheme.total_amount;
                option.dataset.uponEnrollment = scheme.upon_enrollment || 0;
                option.dataset.installmentCount = scheme.installment_count || 1;
                option.dataset.installmentAmount = scheme.installment_amount || 0;
                select.appendChild(option);
            });
        }

        document.getElementById('paymentModal').classList.add('active');
    } catch (error) {
        showToast('Failed to load application details', 'error');
    }
}

function closeModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('paymentForm').reset();
    document.getElementById('installmentBreakdown').style.display = 'none';
}

// Update breakdown when scheme changes
document.getElementById('schemeId')?.addEventListener('change', updateInstallmentBreakdown);

// ============================================
// Payment Assignment
// ============================================

async function submitPayment() {
    const applicationId = document.getElementById('applicationId').value;
    const schemeId = document.getElementById('schemeId').value;
    const notes = document.getElementById('notes').value;
    const isCustom = document.getElementById('customPaymentEnabled').checked;

    if (!schemeId) {
        showToast('Please select a payment scheme', 'warning');
        return;
    }

    try {
        const scheme = STATE.paymentSchemes.find(s => s.scheme_id == schemeId);
        
        let paymentData = {
            applicationId,
            schemeId,
            totalAmount: scheme.total_amount,
            notes
        };

        // If custom payment is enabled
        if (isCustom) {
            const customDownPayment = parseFloat(document.getElementById('customDownPayment').value || 0);
            const customInstallmentCount = parseInt(document.getElementById('customInstallmentCount').value || 1);
            const customReason = document.getElementById('customPaymentReason').value;
            
            if (!customReason.trim()) {
                showToast('Please provide a reason for custom payment', 'warning');
                return;
            }
            
            const remaining = scheme.total_amount - customDownPayment;
            const customInstallmentAmount = remaining / customInstallmentCount;
            
            paymentData.isCustom = true;
            paymentData.customDownPayment = customDownPayment;
            paymentData.customInstallmentCount = customInstallmentCount;
            paymentData.customInstallmentAmount = customInstallmentAmount.toFixed(2);
            paymentData.customReason = customReason;
            paymentData.notes = `${notes}\n\n[CUSTOM PAYMENT] ${customReason}`;
        }

        await fetchAPI('/payments/create', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });

        showToast('Payment record created successfully!', 'success');
        closeModal();
        loadApplications();
    } catch (error) {
        showToast('Failed to create payment record', 'error');
    }
}

// ============================================
// Bulk Operations
// ============================================

async function bulkAssignPayment() {
    if (STATE.selectedIds.size === 0) {
        showToast('No applications selected', 'warning');
        return;
    }

    // Populate bulk modal
    document.getElementById('bulkModalCount').textContent =
        `Assign payment scheme to ${STATE.selectedIds.size} application(s)`;

    const select = document.getElementById('bulkSchemeId');
    select.innerHTML = '<option value="">Select payment scheme...</option>';

    STATE.paymentSchemes.forEach(scheme => {
        const option = document.createElement('option');
        option.value = scheme.scheme_id;
        option.textContent = `${scheme.scheme_name} - ${formatCurrency(scheme.total_amount)}`;
        option.dataset.amount = scheme.total_amount;
        select.appendChild(option);
    });

    document.getElementById('bulkModal').classList.add('active');
}

function closeBulkModal() {
    document.getElementById('bulkModal').classList.remove('active');
    document.getElementById('bulkPaymentForm').reset();
}

async function submitBulkPayment() {
    const schemeId = document.getElementById('bulkSchemeId').value;
    const notes = document.getElementById('bulkNotes').value;

    if (!schemeId) {
        showToast('Please select a payment scheme', 'warning');
        return;
    }

    try {
        const scheme = STATE.paymentSchemes.find(s => s.scheme_id == schemeId);
        const selectedIds = Array.from(STATE.selectedIds);

        await fetchAPI('/payments/bulk-create', {
            method: 'POST',
            body: JSON.stringify({
                applicationIds: selectedIds,
                schemeId,
                totalAmount: scheme.total_amount,
                notes
            })
        });

        showToast(
            `Payment assigned to ${STATE.selectedIds.size} application(s)!`,
            'success'
        );
        closeBulkModal();
        clearBulkSelection();
        loadApplications();
    } catch (error) {
        showToast('Failed to assign payment records', 'error');
    }
}

// ============================================
// Export Functionality
// ============================================

function exportData() {
    if (STATE.filteredApplications.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = ['ID', 'Name', 'Level', 'Grade', 'Approved Date', 'Status', 'Payment Status'];
    const rows = STATE.filteredApplications.map(app => [
        app.application_id,
        `${app.first_name} ${app.last_name}`,
        app.school_level,
        app.grade_level,
        formatDate(app.reviewed_at),
        'Approved',
        app.payment_record_id ? 'Assigned' : 'Pending'
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-admissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Data exported successfully', 'success');
}

// ============================================
// Modal Click Outside to Close
// ============================================

document.getElementById('paymentModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'paymentModal') closeModal();
});

document.getElementById('bulkModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'bulkModal') closeBulkModal();
});

// Escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeBulkModal();
    }
});

function toggleCustomPayment() {
    const isEnabled = document.getElementById('customPaymentEnabled').checked;
    const customFields = document.getElementById('customPaymentFields');
    const schemeSelect = document.getElementById('schemeId');
    const schemeOption = schemeSelect.options[schemeSelect.selectedIndex];
    
    if (!schemeOption || !schemeOption.value) {
        showToast('Please select a payment scheme first', 'warning');
        document.getElementById('customPaymentEnabled').checked = false;
        return;
    }
    
    if (isEnabled) {
        customFields.style.display = 'block';
        
        // Get scheme data
        const totalAmount = parseFloat(schemeOption?.dataset.amount || 0);
        const defaultDownPayment = parseFloat(schemeOption?.dataset.uponEnrollment || 0);
        const defaultInstallments = parseInt(schemeOption?.dataset.installmentCount || 1);
        
        // Pre-populate with scheme defaults
        document.getElementById('customDownPayment').value = defaultDownPayment;
        document.getElementById('customInstallmentCount').value = defaultInstallments;
        
        // Ensure total amount is visible
        document.getElementById('totalAmount').value = formatCurrency(totalAmount);
        
        recalculateCustomBreakdown();
    } else {
        customFields.style.display = 'none';
        // Clear custom fields
        document.getElementById('customDownPayment').value = '';
        document.getElementById('customPaymentReason').value = '';
        // Revert to original scheme breakdown
        updateInstallmentBreakdown();
    }
}

function recalculateCustomBreakdown() {
    const schemeSelect = document.getElementById('schemeId');
    const schemeOption = schemeSelect.options[schemeSelect.selectedIndex];
    const totalAmount = parseFloat(schemeOption?.dataset.amount || 0);
    
    const customDownPayment = parseFloat(document.getElementById('customDownPayment').value || 0);
    const customInstallmentCount = parseInt(document.getElementById('customInstallmentCount').value || 1);
    
    if (!totalAmount) {
        showToast('Please select a payment scheme first', 'warning');
        return;
    }
    
    // Validate custom down payment
    if (customDownPayment < 0) {
        showToast('Down payment cannot be negative', 'warning');
        document.getElementById('customDownPayment').value = 0;
        return;
    }
    
    if (customDownPayment > totalAmount) {
        showToast('Down payment cannot exceed total amount', 'warning');
        document.getElementById('customDownPayment').value = totalAmount;
        return;
    }
    
    const remaining = totalAmount - customDownPayment;
    const monthlyAmount = remaining / customInstallmentCount;
    
    // Update the total amount display (should stay the same)
    document.getElementById('totalAmount').value = formatCurrency(totalAmount);
    
    const breakdownDiv = document.getElementById('installmentBreakdown');
    const breakdownList = document.getElementById('breakdownList');
    
    breakdownDiv.style.display = 'block';
    breakdownList.innerHTML = '';
    
    let installments = [];
    
    // Custom down payment
    if (customDownPayment > 0) {
        installments.push({
            number: 0,
            label: '⚠️ Custom Down Payment',
            amount: customDownPayment,
            due: 'Upon Enrollment'
        });
    }
    
    // Monthly installments
    for (let i = 1; i <= customInstallmentCount; i++) {
        installments.push({
            number: i,
            label: `Monthly ${i}`,
            amount: monthlyAmount,
            due: i === 1 ? 'Upon Enrollment' : `${i * 30} days after enrollment`
        });
    }
    
    installments.forEach(inst => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `
            <div class="breakdown-number">
                <span class="installment-badge ${inst.number === 0 ? 'custom-badge' : ''}">${inst.number === 0 ? 'DP' : inst.number}</span>
            </div>
            <div class="breakdown-details">
                <div class="breakdown-label">${inst.label}</div>
                <div class="breakdown-due">${inst.due}</div>
            </div>
            <div class="breakdown-amount">${formatCurrency(inst.amount)}</div>
        `;
        breakdownList.appendChild(div);
    });
    
    // Show summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'breakdown-summary';
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Total Amount:</span>
            <strong>${formatCurrency(totalAmount)}</strong>
        </div>
        <div class="summary-row">
            <span>Down Payment:</span>
            <strong>${formatCurrency(customDownPayment)}</strong>
        </div>
        <div class="summary-row">
            <span>Remaining:</span>
            <strong>${formatCurrency(remaining)}</strong>
        </div>
        <div class="summary-row">
            <span>Monthly Payment:</span>
            <strong>${formatCurrency(monthlyAmount)}</strong>
        </div>
    `;
    breakdownList.appendChild(summaryDiv);
    
    // Reset to collapsed state
    breakdownList.classList.remove('expanded');
    breakdownList.style.maxHeight = '0';
    
    // Update button text
    const toggleBtn = document.getElementById('toggleBreakdownBtn');
    if (toggleBtn) {
        toggleBtn.innerHTML = '▼ Show Breakdown';
    }
}


// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadPaymentSchemes();
    await loadApplications();
});
