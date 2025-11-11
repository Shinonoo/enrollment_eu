let allSubjects = [];
let currentEditId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', function () {
    loadSubjects();
    setupFilters();
});

// Load subjects from API
async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects');
        const data = await response.json();
        allSubjects = data.subjects || [];
        renderTable();
    } catch (error) {
        console.error('Error loading subjects:', error);
        document.getElementById('subjectsTable').innerHTML = '<tr><td colspan="9" class="no-data">Error loading data</td></tr>';
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('subjectsTable');
    if (allSubjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No subjects found</td></tr>';
        return;
    }

    tbody.innerHTML = allSubjects.map(subject => `
        <tr>
            <td>${subject.subject_code}</td>
            <td>${subject.subject_name}</td>
            <td><span class="badge badge-level">${subject.school_level}</span></td>
            <td>${subject.grade_level}</td>
            <td>${subject.strand || '-'}</td>
            <td>${subject.units}</td>
            <td><span class="badge badge-semester">${subject.semester}</span></td>
            <td>
                <button class="btn-toggle ${subject.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                        onclick="toggleStatus(${subject.subject_id})">
                    ${subject.is_active ? 'Active' : 'Inactive'}
                </button>
            </td>
            <td class="actions">
                <button class="btn-icon btn-edit" onclick="editSubject(${subject.subject_id})" title="Edit">✏️</button>
                <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.subject_id})" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Setup filters
function setupFilters() {
    document.getElementById('searchInput').addEventListener('keyup', filterTable);
    document.getElementById('filterSchool').addEventListener('change', filterTable);
    document.getElementById('filterGrade').addEventListener('change', filterTable);
}

// Filter table
function filterTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const schoolFilter = document.getElementById('filterSchool').value;
    const gradeFilter = document.getElementById('filterGrade').value;

    const filtered = allSubjects.filter(s => {
        const matchesSearch = s.subject_code.toLowerCase().includes(search) ||
            s.subject_name.toLowerCase().includes(search);
        const matchesSchool = !schoolFilter || s.school_level === schoolFilter;
        const matchesGrade = !gradeFilter || s.grade_level === gradeFilter;
        return matchesSearch && matchesSchool && matchesGrade;
    });

    document.getElementById('subjectsTable').innerHTML = filtered.length === 0
        ? '<tr><td colspan="9" class="no-data">No subjects found</td></tr>'
        : filtered.map(subject => `
            <tr>
                <td>${subject.subject_code}</td>
                <td>${subject.subject_name}</td>
                <td><span class="badge badge-level">${subject.school_level}</span></td>
                <td>${subject.grade_level}</td>
                <td>${subject.strand || '-'}</td>
                <td>${subject.units}</td>
                <td><span class="badge badge-semester">${subject.semester}</span></td>
                <td>
                    <button class="btn-toggle ${subject.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                            onclick="toggleStatus(${subject.subject_id})">
                        ${subject.is_active ? 'Active' : 'Inactive'}
                    </button>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editSubject(${subject.subject_id})" title="Edit">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.subject_id})" title="Delete">🗑️</button>
                </td>
            </tr>
        `).join('');
}

// Open create modal
function openCreateModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Create Subject';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('subjectModal').classList.remove('active');
    currentEditId = null;
}

// Edit subject
function editSubject(id) {
    const subject = allSubjects.find(s => s.subject_id === id);
    if (!subject) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Subject';
    document.getElementById('subjectCode').value = subject.subject_code;
    document.getElementById('subjectName').value = subject.subject_name;
    document.getElementById('schoolLevel').value = subject.school_level;
    document.getElementById('gradeLevel').value = subject.grade_level;
    document.getElementById('strand').value = subject.strand || '';
    document.getElementById('units').value = subject.units;
    document.getElementById('semester').value = subject.semester;
    document.getElementById('isRequired').checked = subject.is_required;
    document.getElementById('description').value = subject.description || '';

    document.getElementById('subjectModal').classList.add('active');
}

// Handle form submit
async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('subjectForm'));

    const data = {
        subject_code: formData.get('subject_code'),
        subject_name: formData.get('subject_name'),
        school_level: formData.get('school_level'),
        grade_level: formData.get('grade_level'),
        strand: formData.get('strand') || null,
        units: formData.get('units'),
        semester: formData.get('semester'),
        is_required: document.getElementById('isRequired').checked ? 1 : 0,
        description: formData.get('description') || null
    };

    try {
        const url = currentEditId
            ? `/api/subjects/${currentEditId}/update`
            : '/api/subjects/create';

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadSubjects();
        } else {
            alert('Error saving subject');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving subject');
    }
}

// Toggle status
async function toggleStatus(id) {
    try {
        const response = await fetch(`/api/subjects/${id}/toggle-status`, { method: 'POST' });
        if (response.ok) {
            loadSubjects();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Delete subject
async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
        const response = await fetch(`/api/subjects/${id}/delete`, { method: 'POST' });
        if (response.ok) {
            loadSubjects();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

