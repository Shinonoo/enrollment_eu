const token = localStorage.getItem('token');
let currentFacultyId = null;

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/faculty/statistics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const stats = data.statistics;
            document.getElementById('totalFaculty').textContent = stats.total_faculty || 0;
            document.getElementById('activeFaculty').textContent = stats.active_faculty || 0;
            document.getElementById('inactiveFaculty').textContent = stats.inactive_faculty || 0;
            document.getElementById('totalDepartments').textContent = stats.total_departments || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadFaculty() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('facultyTable').style.display = 'none';

    try {
        const search = document.getElementById('searchInput').value;
        const department = document.getElementById('departmentFilter').value;

        let url = 'http://localhost:3000/api/faculty?';
        if (search) url += `search=${search}&`;
        if (department) url += `department=${department}&`;

        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        document.getElementById('loading').style.display = 'none';

        if (response.ok && data.success) {
            if (data.faculty.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayFaculty(data.faculty);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
    }
}

function displayFaculty(faculty) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    faculty.forEach(member => {
        const row = document.createElement('tr');
        const statusBadge = member.is_active ?
            '<span class="badge badge-active">Active</span>' :
            '<span class="badge badge-inactive">Inactive</span>';

        row.innerHTML = `
                    <td><strong>${member.first_name} ${member.last_name}</strong></td>
                    <td>${member.email}</td>
                    <td>${member.department}</td>
                    <td>${member.position}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="editFaculty(${member.faculty_id})" class="btn btn-primary btn-sm">Edit</button>
                        <button onclick="deleteFaculty(${member.faculty_id})" class="btn btn-danger btn-sm">Delete</button>
                    </td>
                `;
        tbody.appendChild(row);
    });

    document.getElementById('facultyTable').style.display = 'table';
}

function openAddFacultyModal() {
    document.getElementById('modalTitle').textContent = 'Add Faculty';
    document.getElementById('facultyForm').reset();
    document.getElementById('isActive').checked = true;
    currentFacultyId = null;
    const modal = document.getElementById('facultyModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

async function editFaculty(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/faculty/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const member = data.faculty;
            document.getElementById('modalTitle').textContent = 'Edit Faculty';
            document.getElementById('firstName').value = member.first_name || '';
            document.getElementById('lastName').value = member.last_name || '';
            document.getElementById('middleName').value = member.middle_name || '';
            document.getElementById('email').value = member.email || '';
            document.getElementById('phoneNumber').value = member.phone_number || '';

            const deptSelect = document.getElementById('department');
            if (deptSelect) deptSelect.value = member.department || '';

            const posSelect = document.getElementById('position');
            if (posSelect) posSelect.value = member.position || '';

            document.getElementById('yearsOfService').value = member.years_of_service || 0;
            document.getElementById('qualifications').value = member.qualifications || '';
            document.getElementById('isActive').checked = member.is_active ? true : false;
            currentFacultyId = id;

            const modal = document.getElementById('facultyModal');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load faculty');
    }
}

async function submitFaculty() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const middleName = document.getElementById('middleName').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const department = document.getElementById('department').value;
    const position = document.getElementById('position').value;
    const yearsOfService = document.getElementById('yearsOfService').value;
    const qualifications = document.getElementById('qualifications').value;
    const isActive = document.getElementById('isActive').checked;

    if (!firstName || !lastName || !email || !department || !position) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const url = currentFacultyId ?
            `http://localhost:3000/api/faculty/${currentFacultyId}` :
            'http://localhost:3000/api/faculty';

        const method = currentFacultyId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName, middleName, lastName, email, phoneNumber,
                department, position, yearsOfService, qualifications, isActive
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert(currentFacultyId ? 'Faculty updated successfully!' : 'Faculty added successfully!');
            closeModal();
            loadFaculty();
            loadStatistics();
        } else {
            alert(data.message || 'Failed to save faculty');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function deleteFaculty(id) {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/faculty/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Faculty deleted successfully!');
            loadFaculty();
            loadStatistics();
        } else {
            alert(data.message || 'Failed to delete faculty');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

function closeModal() {
    const modal = document.getElementById('facultyModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
    currentFacultyId = null;
}

document.getElementById('facultyModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

// Load on page load
loadStatistics();
loadFaculty();
