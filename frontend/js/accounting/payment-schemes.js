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
    allSchemes: [],
    filteredSchemes: [],
    currentPage: 1,
    itemsPerPage: 25,
    sortField: null,
    sortOrder: 'asc',
    debounceTimer: null,
    currentSchemeId: null,
    isEditing: false
};

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
    if (!value || value === 0) return '—';
    return parseFloat(value).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP'
    });
}

function validateForm() {
    const errors = {};
    const schemeName = document.getElementById('schemeName').value.trim();
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const installmentCount = parseInt(document.getElementById('installmentCount').value);

    if (!schemeName) errors.schemeName = 'Scheme name is required';
    if (!schoolLevel) errors.schoolLevel = 'School level is required';
    if (!gradeLevel) errors.gradeLevel = 'Grade level is required';
    if (isNaN(totalAmount) || totalAmount <= 0) errors.totalAmount = 'Total amount must be greater than 0';
    if (isNaN(installmentCount) || installmentCount < 1 || installmentCount > 12) 
        errors.installmentCount = 'Installments must be between 1 and 12';
    if (downPayment > totalAmount) errors.downPayment = 'Down payment cannot exceed total amount';

    Object.keys(errors).forEach(key => {
        const errorElement = document.getElementById(`${key}Error`);
        if (errorElement) {
            errorElement.textContent = errors[key];
        }
    });

    return Object.keys(errors).length === 0;
}

function clearFormErrors() {
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
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

async function loadSchemes() {
    try {
        showLoadingState(true);
        const data = await fetchAPI('/payments/schemes');
        
        STATE.allSchemes = data.schemes || [];
        STATE.filteredSchemes = [...STATE.allSchemes];
        STATE.currentPage = 1;
        
        updateStats();
        updateTable();
        showLoadingState(false);
    } catch (error) {
        showLoadingState(false);
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
    const total = STATE.allSchemes.length;
    const jhs = STATE.allSchemes.filter(s => s.school_level === 'JHS').length;
    const shs = STATE.allSchemes.filter(s => s.school_level === 'SHS').length;
    const avgAmount = total > 0 
        ? STATE.allSchemes.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) / total 
        : 0;

    document.getElementById('totalSchemes').textContent = total;
    document.getElementById('jhsSchemes').textContent = jhs;
    document.getElementById('shsSchemes').textContent = shs;
    document.getElementById('avgAmount').textContent = formatCurrency(avgAmount);
}

// ============================================
// Filtering & Sorting
// ============================================

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const level = document.getElementById('levelFilter').value;
    const grade = document.getElementById('gradeFilter').value;

    STATE.filteredSchemes = STATE.allSchemes.filter(scheme => {
        const matchSearch = !search || 
            scheme.scheme_name.toLowerCase().includes(search);

        const matchLevel = !level || scheme.school_level === level;
        const matchGrade = !grade || scheme.grade_level.toString() === grade;

        return matchSearch && matchLevel && matchGrade;
    });

    STATE.currentPage = 1;
    updateTable();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('gradeFilter').value = '';
    STATE.filteredSchemes = [...STATE.allSchemes];
    STATE.currentPage = 1;
    updateTable();
}

function sortTable(field) {
    const ths = document.querySelectorAll('.table th.sortable');
    ths.forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));

    if (STATE.sortField === field) {
        STATE.sortOrder = STATE.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        STATE.sortField = field;
        STATE.sortOrder = 'asc';
    }

    STATE.filteredSchemes.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'total_amount' || field === 'upon_enrollment' || field === 'installment_amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

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
    const total = STATE.filteredSchemes.length;
    
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
    const pageData = STATE.filteredSchemes.slice(start, end);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    pageData.forEach(scheme => {
        const row = document.createElement('tr');
        
        const isCash = scheme.installment_count === 1;
        const downPayment = isCash ? 0 : parseFloat(scheme.upon_enrollment || 0);
        const monthlyAmount = isCash ? 0 : parseFloat(scheme.installment_amount || 0);
        const cashPayment = isCash ? parseFloat(scheme.total_amount) : 0;
        const cashDiscount = parseFloat(scheme.cash_discount || 0);
        const totalAfterDiscount = isCash && cashDiscount > 0 
            ? parseFloat(scheme.total_amount) - cashDiscount 
            : parseFloat(scheme.total_amount);

        row.innerHTML = `
            <td><strong>${scheme.scheme_name}</strong></td>
            <td><span class="badge badge-${scheme.school_level.toLowerCase()}">${scheme.school_level}</span></td>
            <td>Grade ${scheme.grade_level}</td>
            <td>${formatCurrency(downPayment)}</td>
            <td>${monthlyAmount > 0 ? `${formatCurrency(monthlyAmount)} <span style="font-size: 0.75rem; color: #6b7280;">(${scheme.installment_count}x)</span>` : '—'}</td>
            <td>${formatCurrency(cashPayment)}</td>
            <td>${formatCurrency(cashDiscount)}</td>
            <td><strong>${formatCurrency(totalAfterDiscount)}</strong></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="openEditModal(${scheme.scheme_id})" class="btn btn-edit btn-sm" title="Edit">✎</button>
                    <button onclick="openDeleteModal(${scheme.scheme_id}, '${scheme.scheme_name}')" class="btn btn-delete btn-sm" title="Delete">🗑</button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    updatePaginationInfo();
}

function renderPagination() {
    const total = STATE.filteredSchemes.length;
    const totalPages = Math.ceil(total / STATE.itemsPerPage);

    document.getElementById('prevBtn').disabled = STATE.currentPage === 1;
    document.getElementById('nextBtn').disabled = STATE.currentPage === totalPages;

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
    const total = STATE.filteredSchemes.length;
    const start = (STATE.currentPage - 1) * STATE.itemsPerPage + 1;
    const end = Math.min(STATE.currentPage * STATE.itemsPerPage, total);

    document.getElementById('pageStart').textContent = start;
    document.getElementById('pageEnd').textContent = end;
    document.getElementById('pageTotal').textContent = total;
}

function nextPage() {
    const totalPages = Math.ceil(STATE.filteredSchemes.length / STATE.itemsPerPage);
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
// Modal Management
// ============================================

function openCreateModal() {
    STATE.isEditing = false;
    STATE.currentSchemeId = null;
    document.getElementById('modalTitle').textContent = 'Create Payment Scheme';
    document.getElementById('schemeId').value = '';
    document.getElementById('schemeForm').reset();
    clearFormErrors();
    document.getElementById('installmentPreview').classList.add('hidden');
    document.getElementById('schemeModal').classList.add('active');
}

async function openEditModal(schemeId) {
    try {
        const scheme = STATE.allSchemes.find(s => s.scheme_id === schemeId);
        if (!scheme) {
            showToast('Scheme not found', 'error');
            return;
        }

        STATE.isEditing = true;
        STATE.currentSchemeId = schemeId;
        document.getElementById('modalTitle').textContent = 'Edit Payment Scheme';
        
        document.getElementById('schemeId').value = scheme.scheme_id;
        document.getElementById('schemeName').value = scheme.scheme_name;
        document.getElementById('schoolLevel').value = scheme.school_level;
        document.getElementById('gradeLevel').value = scheme.grade_level;
        document.getElementById('totalAmount').value = scheme.total_amount;
        document.getElementById('downPayment').value = scheme.upon_enrollment || 0;
        document.getElementById('installmentCount').value = scheme.installment_count;
        document.getElementById('cashDiscount').value = scheme.cash_discount || 0;
        document.getElementById('description').value = scheme.description || '';
        
        clearFormErrors();
        calculateInstallments();
        document.getElementById('schemeModal').classList.add('active');
    } catch (error) {
        showToast('Failed to load scheme details', 'error');
    }
}

function closeModal() {
    document.getElementById('schemeModal').classList.remove('active');
    document.getElementById('schemeForm').reset();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

// ============================================
// Form Interactions
// ============================================

function calculateInstallments() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const count = parseInt(document.getElementById('installmentCount').value) || 1;

    if (totalAmount > 0 && count > 0) {
        const remaining = totalAmount - downPayment;
        const perInstallment = remaining / count;
        const details = document.getElementById('installmentDetails');
        details.innerHTML = '';

        if (count === 1) {
            details.innerHTML = `
                <div class="installment-item">
                    <strong>Cash Payment</strong>
                    <span>${formatCurrency(totalAmount)}</span>
                </div>
            `;
        } else {
            if (downPayment > 0) {
                const dp = document.createElement('div');
                dp.className = 'installment-item';
                dp.innerHTML = `
                    <strong>Down Payment</strong>
                    <span>${formatCurrency(downPayment)}</span>
                `;
                details.appendChild(dp);
            }

            for (let i = 1; i <= count; i++) {
                const installment = document.createElement('div');
                installment.className = 'installment-item';
                installment.innerHTML = `
                    <strong>Monthly ${i}</strong>
                    <span>${formatCurrency(perInstallment)}</span>
                `;
                details.appendChild(installment);
            }
        }

        document.getElementById('installmentPreview').classList.remove('hidden');
    } else {
        document.getElementById('installmentPreview').classList.add('hidden');
    }
}

function updateRelevantGrades() {
    const level = document.getElementById('schoolLevel').value;
    const gradeSelect = document.getElementById('gradeLevel');
    
    if (level === 'JHS') {
        gradeSelect.innerHTML = `
            <option value="">Select Grade</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
        `;
    } else if (level === 'SHS') {
        gradeSelect.innerHTML = `
            <option value="">Select Grade</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
        `;
    }
}

// ============================================
// CRUD Operations
// ============================================

async function submitScheme() {
    if (!validateForm()) {
        showToast('Please fix the errors above', 'warning');
        return;
    }

    const schemeId = document.getElementById('schemeId').value;
    const schemeName = document.getElementById('schemeName').value;
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const downPayment = document.getElementById('downPayment').value || 0;  // ADD THIS
    const installmentCount = document.getElementById('installmentCount').value;
    const cashDiscount = document.getElementById('cashDiscount').value || 0;  // ADD THIS
    const description = document.getElementById('description').value;

    const remaining = parseFloat(totalAmount) - parseFloat(downPayment);
    const installmentAmount = remaining / parseInt(installmentCount);

    try {
        const endpoint = STATE.isEditing 
            ? `/payments/schemes/${schemeId}`
            : '/payments/schemes';

        const method = STATE.isEditing ? 'PUT' : 'POST';

        await fetchAPI(endpoint, {
            method,
            body: JSON.stringify({
                schemeName,
                schoolLevel,
                gradeLevel,
                totalAmount,
                uponEnrollment: downPayment,        // ADD THIS
                installmentCount,
                installmentAmount: installmentAmount.toFixed(2),
                cashDiscount,                        // ADD THIS
                description
            })
        });

        showToast(
            STATE.isEditing 
                ? 'Scheme updated successfully!' 
                : 'Scheme created successfully!',
            'success'
        );
        
        closeModal();
        loadSchemes();
    } catch (error) {
        showToast('Failed to save scheme', 'error');
    }
}

function openDeleteModal(schemeId, schemeName) {
    STATE.currentSchemeId = schemeId;
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete "${schemeName}"? This action cannot be undone.`;
    document.getElementById('deleteModal').classList.add('active');
}

async function confirmDelete() {
    try {
        await fetchAPI(`/payments/schemes/${STATE.currentSchemeId}`, {
            method: 'DELETE'
        });

        showToast('Scheme deleted successfully!', 'success');
        closeDeleteModal();
        loadSchemes();
    } catch (error) {
        showToast('Failed to delete scheme', 'error');
    }
}

// ============================================
// Export Functionality
// ============================================

function exportSchemes() {
    if (STATE.filteredSchemes.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = ['Scheme Name', 'Level', 'Grade', 'Down Payment', 'Monthly', 'Cash Payment', 'Cash Discount', 'Total'];
    const rows = STATE.filteredSchemes.map(scheme => {
        const isCash = scheme.installment_count === 1;
        const downPayment = isCash ? 0 : parseFloat(scheme.upon_enrollment || 0);
        const monthlyAmount = isCash ? 0 : parseFloat(scheme.installment_amount || 0);
        const cashPayment = isCash ? parseFloat(scheme.total_amount) : 0;
        const cashDiscount = parseFloat(scheme.cash_discount || 0);
        const total = isCash && cashDiscount > 0 
            ? parseFloat(scheme.total_amount) - cashDiscount 
            : parseFloat(scheme.total_amount);

        return [
            scheme.scheme_name,
            scheme.school_level,
            scheme.grade_level,
            downPayment.toFixed(2),
            monthlyAmount.toFixed(2),
            cashPayment.toFixed(2),
            cashDiscount.toFixed(2),
            total.toFixed(2)
        ];
    });

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-schemes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Data exported successfully', 'success');
}

// ============================================
// Modal Click Outside to Close
// ============================================

document.getElementById('schemeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'schemeModal') closeModal();
});

document.getElementById('deleteModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'deleteModal') closeDeleteModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
});

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSchemes();
});
