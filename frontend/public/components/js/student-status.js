const token = localStorage.getItem('token');

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        setTimeout(() => tab.classList.add('hidden'), 300);
    });
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    setTimeout(() => {
        document.getElementById(tabName + '-tab').classList.remove('hidden');
        setTimeout(() => document.getElementById(tabName + '-tab').classList.add('active'), 10);
    }, 300);
    event.target.classList.add('active');

    if (tabName === 'completers') loadCompleters();
    if (tabName === 'transferred') loadTransferred();
    if (tabName === 'dropped') loadDropped();
    if (tabName === 'graduated') loadGraduated();
}

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/student-status/statistics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const stats = data.statistics;
            document.getElementById('enrolledCount').textContent = stats.enrolled || 0;
            document.getElementById('completedCount').textContent = stats.completed || 0;
            document.getElementById('transferredCount').textContent = stats.transferred_out || 0;
            document.getElementById('droppedCount').textContent = stats.dropped || 0;
            document.getElementById('graduatedCount').textContent = stats.graduated || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadCompleters() {
    const search = document.getElementById('completersSearch').value;
    const url = `http://localhost:3000/api/student-status/completers?${search ? 'search=' + search : ''}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            displayTable('completers', data.completers);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadTransferred() {
    const search = document.getElementById('transferredSearch').value;
    const url = `http://localhost:3000/api/student-status/transferred?${search ? 'search=' + search : ''}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const tbody = document.getElementById('transferredBody');
            tbody.innerHTML = '';

            if (data.transferred.length === 0) {
                document.getElementById('transferredLoading').style.display = 'block';
                document.getElementById('transferredTable').style.display = 'none';
                return;
            }

            data.transferred.forEach(item => {
                const row = `
                            <tr>
                                <td>${item.student_number}</td>
                                <td>${item.first_name} ${item.last_name}</td>
                                <td>${new Date(item.transfer_date).toLocaleDateString()}</td>
                                <td>${item.transfer_school}</td>
                                <td>${item.reason || '-'}</td>
                                <td><button class="btn btn-primary btn-sm" onclick="viewDetails('transferred', ${item.transfer_id})">View</button></td>
                            </tr>
                        `;
                tbody.innerHTML += row;
            });

            document.getElementById('transferredLoading').style.display = 'none';
            document.getElementById('transferredTable').style.display = 'table';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadDropped() {
    const search = document.getElementById('droppedSearch').value;
    const url = `http://localhost:3000/api/student-status/dropped?${search ? 'search=' + search : ''}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const tbody = document.getElementById('droppedBody');
            tbody.innerHTML = '';

            if (data.dropped.length === 0) {
                document.getElementById('droppedLoading').style.display = 'block';
                document.getElementById('droppedTable').style.display = 'none';
                return;
            }

            data.dropped.forEach(item => {
                const row = `
                            <tr>
                                <td>${item.student_number}</td>
                                <td>${item.first_name} ${item.last_name}</td>
                                <td>${item.school_level} - Grade ${item.current_grade_level}</td>
                                <td>${new Date(item.drop_date).toLocaleDateString()}</td>
                                <td>${item.reason || '-'}</td>
                                <td><button class="btn btn-primary btn-sm" onclick="viewDetails('dropped', ${item.drop_id})">View</button></td>
                            </tr>
                        `;
                tbody.innerHTML += row;
            });

            document.getElementById('droppedLoading').style.display = 'none';
            document.getElementById('droppedTable').style.display = 'table';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadGraduated() {
    const search = document.getElementById('graduatedSearch').value;
    const url = `http://localhost:3000/api/student-status/graduated?${search ? 'search=' + search : ''}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const tbody = document.getElementById('graduatedBody');
            tbody.innerHTML = '';

            if (data.graduated.length === 0) {
                document.getElementById('graduatedLoading').style.display = 'block';
                document.getElementById('graduatedTable').style.display = 'none';
                return;
            }

            data.graduated.forEach(item => {
                const row = `
                            <tr>
                                <td>${item.student_number}</td>
                                <td>${item.first_name} ${item.last_name}</td>
                                <td>${item.strand || '-'}</td>
                                <td>${new Date(item.graduation_date).toLocaleDateString()}</td>
                                <td>${item.with_honors ? `✓ ${item.honor_type}` : '-'}</td>
                                <td><button class="btn btn-primary btn-sm" onclick="viewDetails('graduated', ${item.graduation_id})">View</button></td>
                            </tr>
                        `;
                tbody.innerHTML += row;
            });

            document.getElementById('graduatedLoading').style.display = 'none';
            document.getElementById('graduatedTable').style.display = 'table';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayTable(type, data) {
    const tbody = document.getElementById(type + 'Body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        document.getElementById(type + 'Loading').style.display = 'block';
        document.getElementById(type + 'Table').style.display = 'none';
        return;
    }

    data.forEach(item => {
        let row = '';
        if (type === 'completers') {
            row = `
                        <tr>
                            <td>${item.student_number}</td>
                            <td>${item.first_name} ${item.last_name}</td>
                            <td>${item.school_level}</td>
                            <td>${item.completion_year}</td>
                            <td>${item.will_continue_shs ? '✓ Yes' : '✗ No'}</td>
                            <td><button class="btn btn-primary btn-sm" onclick="viewDetails('completers', ${item.completer_id})">View</button></td>
                        </tr>
                    `;
        }
        tbody.innerHTML += row;
    });

    document.getElementById(type + 'Loading').style.display = 'none';
    document.getElementById(type + 'Table').style.display = 'table';
}

function openCompleterModal() {
    loadStudentsForModal('completerStudent');
    openModalSmooth('completerModal');
}

function openTransferredModal() {
    loadStudentsForModal('transferredStudent');
    openModalSmooth('transferredModal');
}

function openDroppedModal() {
    loadStudentsForModal('droppedStudent');
    openModalSmooth('droppedModal');
}

function openGraduatedModal() {
    loadStudentsForModal('graduatedStudent');
    openModalSmooth('graduatedModal');
}

function openModalSmooth(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

async function loadStudentsForModal(selectId) {
    try {
        const response = await fetch('http://localhost:3000/api/students?enrollmentStatus=enrolled', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Student...</option>';

        data.students.forEach(s => {
            const option = document.createElement('option');
            option.value = s.student_id;
            option.textContent = `${s.first_name} ${s.last_name} (${s.student_number})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function submitCompleter() {
    const studentId = document.getElementById('completerStudent').value;
    const completionYear = document.getElementById('completionYear').value;
    const willContinue = document.getElementById('willContinueSHS').checked;

    if (!studentId) {
        alert('Please select a student');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/student-status/completers', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: parseInt(studentId),
                completionYear,
                willContinueSHS: willContinue
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student marked as completer!');
            closeModal('completerModal');
            loadCompleters();
            loadStatistics();
        } else {
            alert(data.message || 'Failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function submitTransferred() {
    const studentId = document.getElementById('transferredStudent').value;
    const transferSchool = document.getElementById('transferSchool').value;
    const transferAddress = document.getElementById('transferAddress').value;
    const reason = document.getElementById('transferReason').value;

    if (!studentId || !transferSchool) {
        alert('Please fill in required fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/student-status/transferred', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: parseInt(studentId),
                transferSchool,
                transferAddress,
                reason
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student marked as transferred!');
            closeModal('transferredModal');
            loadTransferred();
            loadStatistics();
        } else {
            alert(data.message || 'Failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function submitDropped() {
    const studentId = document.getElementById('droppedStudent').value;
    const reason = document.getElementById('dropReason').value;

    if (!studentId) {
        alert('Please select a student');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/student-status/dropped', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: parseInt(studentId),
                reason
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student marked as dropped!');
            closeModal('droppedModal');
            loadDropped();
            loadStatistics();
        } else {
            alert(data.message || 'Failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function submitGraduated() {
    const studentId = document.getElementById('graduatedStudent').value;
    const graduationYear = document.getElementById('graduationYear').value;
    const strand = document.getElementById('graduationStrand').value;
    const withHonors = document.getElementById('withHonors').checked;
    const honorType = document.getElementById('honorType').value;

    if (!studentId) {
        alert('Please select a student');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/student-status/graduated', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: parseInt(studentId),
                graduationYear,
                strand,
                withHonors,
                honorType: withHonors ? honorType : null
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student marked as graduated!');
            closeModal('graduatedModal');
            loadGraduated();
            loadStatistics();
        } else {
            alert(data.message || 'Failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('withHonors').addEventListener('change', function () {
        document.getElementById('honorTypeGroup').style.display = this.checked ? 'block' : 'none';
    });

    loadStatistics();
    loadCompleters();
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});
