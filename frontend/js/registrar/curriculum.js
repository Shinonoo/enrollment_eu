let allCurricula = [];
let allSubjects = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', function () {
    loadCurricula();
    loadSubjects();
    setupFilters();
});

// Load curricula from API
async function loadCurricula() {
    try {
        const response = await fetch('/api/curriculum', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        allCurricula = data.curricula || [];
        renderTable();
    } catch (error) {
        console.error('Error loading curricula:', error);
        document.getElementById('curriculaTable').innerHTML = 
            '<tr><td colspan="8" class="no-data">Error loading data</td></tr>';
    }
}

// Load subjects from API
async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        allSubjects = data.subjects || [];
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('curriculaTable');
    if (allCurricula.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No curricula found</td></tr>';
        return;
    }

    tbody.innerHTML = allCurricula.map(curriculum => `
        <tr>
            <td>${curriculum.curriculum_code}</td>
            <td>${curriculum.curriculum_name}</td>
            <td><span class="badge badge-level">${curriculum.school_level}</span></td>
            <td>${curriculum.grade_level}</td>
            <td>${curriculum.strand || '-'}</td>
            <td><span class="subject-count">${curriculum.subject_count || 0}</span></td>
            <td>
                <button class="btn-toggle ${curriculum.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                        onclick="toggleStatus(${curriculum.curriculum_id})">
                    ${curriculum.is_active ? 'Active' : 'Inactive'}
                </button>
            </td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="viewCurriculum(${curriculum.curriculum_id})">View</button>
                <button class="btn-icon btn-edit" onclick="editCurriculum(${curriculum.curriculum_id})" title="Edit">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteCurriculum(${curriculum.curriculum_id})" title="Delete">Delete</button>
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

    const filtered = allCurricula.filter(c => {
        const matchesSearch = c.curriculum_code.toLowerCase().includes(search) ||
            c.curriculum_name.toLowerCase().includes(search);
        const matchesSchool = !schoolFilter || c.school_level === schoolFilter;
        const matchesGrade = !gradeFilter || c.grade_level === gradeFilter;
        return matchesSearch && matchesSchool && matchesGrade;
    });

    const tbody = document.getElementById('curriculaTable');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No curricula found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(curriculum => `
        <tr>
            <td>${curriculum.curriculum_code}</td>
            <td>${curriculum.curriculum_name}</td>
            <td><span class="badge badge-level">${curriculum.school_level}</span></td>
            <td>${curriculum.grade_level}</td>
            <td>${curriculum.strand || '-'}</td>
            <td><span class="subject-count">${curriculum.subject_count || 0}</span></td>
            <td>
                <button class="btn-toggle ${curriculum.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                        onclick="toggleStatus(${curriculum.curriculum_id})">
                    ${curriculum.is_active ? 'Active' : 'Inactive'}
                </button>
            </td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="viewCurriculum(${curriculum.curriculum_id})">View</button>
                <button class="btn-icon btn-edit" onclick="editCurriculum(${curriculum.curriculum_id})" title="Edit">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteCurriculum(${curriculum.curriculum_id})" title="Delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Open CREATE modal
function openCreateModal() {
    // Clear form
    document.getElementById('curriculumForm').reset();
    document.getElementById('modalTitle').textContent = 'Create Curriculum';
    
    // Remove curriculum ID (indicates new curriculum)
    delete document.getElementById('curriculumForm').dataset.curriculumId;
    
    // Clear subjects container
    document.getElementById('subjectsContainer').innerHTML = 
        '<p style="color: #7f8c8d; text-align: center;">Select school and grade level first</p>';
    
    // Show modal
    document.getElementById('curriculumModal').style.display = 'flex';
}

// Open EDIT modal
async function editCurriculum(curriculumId) {
    try {
        console.log('✏️ Opening edit modal for curriculum:', curriculumId);
        
        // Fetch curriculum details with subjects
        const response = await fetch(`/api/curriculum/${curriculumId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('Failed to load curriculum details');
            return;
        }
        
        const curriculum = data.curriculum;
        const assignedSubjects = data.subjects || [];
        
        // Set form title
        document.getElementById('modalTitle').textContent = 'Edit Curriculum';
        
        // Populate form fields
        document.getElementById('curriculumCode').value = curriculum.curriculum_code || '';
        document.getElementById('curriculumName').value = curriculum.curriculum_name || '';
        document.getElementById('schoolLevel').value = curriculum.school_level || '';
        document.getElementById('gradeLevel').value = curriculum.grade_level || '';
        document.getElementById('strand').value = curriculum.strand || '';
        document.getElementById('description').value = curriculum.description || '';
        
        // Store curriculum ID for update
        document.getElementById('curriculumForm').dataset.curriculumId = curriculumId;
        
        // Load subjects with already-assigned ones marked
        await loadSubjectsForEdit(curriculum.school_level, curriculum.grade_level, assignedSubjects);
        
        // Show modal
        document.getElementById('curriculumModal').style.display = 'flex';
        
    } catch (error) {
        console.error('❌ Error loading curriculum for edit:', error);
        alert('Error loading curriculum details');
    }
}

// Load subjects for CREATE mode (all subjects selectable)
async function filterSubjectsByLevel() {
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const container = document.getElementById('subjectsContainer');

    if (!schoolLevel || !gradeLevel) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">Select school and grade level first</p>';
        return;
    }

    // Filter subjects by level
    const filtered = allSubjects.filter(s => 
        s.school_level === schoolLevel && s.grade_level === gradeLevel
    );

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No subjects available</p>';
        return;
    }

    // Display all subjects as selectable (for CREATE mode)
    container.innerHTML = filtered.map(subject => `
        <div class="subject-checkbox-item">
            <label>
                <input 
                    type="checkbox" 
                    name="subjects[]" 
                    value="${subject.subject_id}"
                    data-subject-name="${subject.subject_name}"
                >
                <span class="subject-label">
                    <strong>${subject.subject_code || 'N/A'}</strong> - ${subject.subject_name}
                </span>
            </label>
        </div>
    `).join('');
}

// Load subjects for EDIT mode (mark already assigned)
async function loadSubjectsForEdit(schoolLevel, gradeLevel, assignedSubjects) {
    try {
        console.log('📚 Loading subjects for edit');
        
        // Filter all subjects by school level and grade level
        const filtered = allSubjects.filter(s => 
            s.school_level === schoolLevel && s.grade_level === gradeLevel
        );
        
        if (filtered.length === 0) {
            document.getElementById('subjectsContainer').innerHTML = 
                '<p class="no-data">No subjects available for this level</p>';
            return;
        }
        
        // Create a Set of already-assigned subject IDs for quick lookup
        const assignedSubjectIds = new Set(assignedSubjects.map(s => s.subject_id));
        
        // Display subjects with checkboxes
        const container = document.getElementById('subjectsContainer');
        container.innerHTML = filtered.map(subject => {
            const isAssigned = assignedSubjectIds.has(subject.subject_id);
            
            return `
                <div class="subject-checkbox-item ${isAssigned ? 'already-assigned' : ''}">
                    <label>
                        <input 
                            type="checkbox" 
                            name="subjects[]" 
                            value="${subject.subject_id}"
                            ${isAssigned ? 'checked' : ''}
                            data-subject-name="${subject.subject_name}"
                        >
                        <span class="subject-label">
                            <strong>${subject.subject_code || 'N/A'}</strong> - ${subject.subject_name}
                            ${isAssigned ? '<span class="badge-assigned">Already Assigned</span>' : ''}
                        </span>
                    </label>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error loading subjects:', error);
    }
}

// Handle form submit (CREATE or EDIT)
async function handleFormSubmit(event) {
    event.preventDefault();

    const curriculumId = event.target.dataset.curriculumId;
    // Gather form data
    const formData = {
        curriculum_code: document.getElementById('curriculumCode').value,
        curriculum_name: document.getElementById('curriculumName').value,
        school_level: document.getElementById('schoolLevel').value,
        grade_level: document.getElementById('gradeLevel').value,
        strand: document.getElementById('strand').value,
        description: document.getElementById('description').value
    };

    // Get list of all subjects in form and selected
    const allSubjects = Array.from(document.querySelectorAll('#subjectsContainer input[type="checkbox"]')).map(cb => parseInt(cb.value));
    const selectedSubjects = Array.from(
        document.querySelectorAll('#subjectsContainer input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    try {
        if (curriculumId) {
            await updateCurriculum(curriculumId, selectedSubjects, allSubjects);
        } else {
            await createCurriculum(formData, selectedSubjects);
        }
        closeModal();
        loadCurricula();
    } catch (error) {
        console.error('Error saving curriculum:', error);
        alert('Error saving curriculum: ' + error.message);
    }
}


async function removeSubjectFromCurriculum(curriculumId, subjectId) {
    try {
        const response = await fetch(`/api/curriculum/${curriculumId}/remove-subject/${subjectId}`, {
            method: 'POST', // or DELETE depending on your API setup
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to remove subject:', data.message);
        }
        return data;
    } catch (error) {
        console.error('Error removing subject:', error);
    }
}


// Add a single subject to curriculum
async function addSubjectToCurriculum(curriculumId, subjectId) {
    try {
        const response = await fetch(`/api/curriculum/${curriculumId}/add-subject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                subject_id: subjectId,
                semester: 'Both',
                is_required: 1
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to add subject:', data.message);
        }
        
        return data;
    } catch (error) {
        console.error('Error adding subject:', error);
    }
}

// Close modal
function closeModal() {
    document.getElementById('curriculumModal').style.display = 'none';
    document.getElementById('curriculumForm').reset();
    delete document.getElementById('curriculumForm').dataset.curriculumId;
}

// View curriculum details
async function viewCurriculum(curriculumId) {
    try {
        console.log('👁️ Viewing curriculum:', curriculumId);
        
        const response = await fetch(`/api/curriculum/${curriculumId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('Failed to load curriculum details');
            return;
        }
        
        displayCurriculumInViewModal(data.curriculum, data.subjects);
        
    } catch (error) {
        console.error('❌ Error loading curriculum:', error);
        alert('Error loading curriculum details');
    }
}

// Display curriculum in VIEW modal
function displayCurriculumInViewModal(curriculum, subjects) {
    console.log('📋 Displaying curriculum:', curriculum.curriculum_name);
    console.log('📚 Subjects count:', subjects.length);
    
    // Update modal content
    document.getElementById('viewCurriculumTitle').textContent = curriculum.curriculum_name;
    document.getElementById('viewCurriculumCode').textContent = curriculum.curriculum_code || 'N/A';
    document.getElementById('viewSchoolLevel').textContent = curriculum.school_level;
    document.getElementById('viewGradeLevel').textContent = curriculum.grade_level;
    document.getElementById('viewStrand').textContent = curriculum.strand || 'N/A';
    document.getElementById('viewStatus').textContent = curriculum.is_active ? 'Active' : 'Inactive';
    document.getElementById('viewCreated').textContent = new Date(curriculum.created_at).toLocaleDateString();
    document.getElementById('subjectCount').textContent = subjects.length;
    
    // Display subjects list
    const subjectsContainer = document.getElementById('curriculumSubjectsList');
    
    if (!subjects || subjects.length === 0) {
        subjectsContainer.innerHTML = '<p class="no-subjects-message">No subjects assigned to this curriculum</p>';
    } else {
        subjectsContainer.innerHTML = subjects.map(subject => `
            <div class="subject-item-display">
                <div class="subject-header-display">
                    <span class="subject-code-display"><strong>${subject.subject_code || 'N/A'}</strong></span>
                    ${subject.is_required ? 
                        '<span class="badge-required">Required</span>' : 
                        '<span class="badge-elective">Elective</span>'}
                </div>
                <div class="subject-name-display">${subject.subject_name}</div>
                <div class="subject-meta-display">
                    ${subject.semester !== 'Both' ? 
                        `<span class="badge-semester">Semester ${subject.semester}</span>` : 
                        '<span class="badge-full-year">Full Year</span>'}
                </div>
            </div>
        `).join('');
    }
    
    // Show modal
    document.getElementById('viewCurriculumModal').style.display = 'flex';
}

// Close view modal
function closeViewCurriculumModal() {
    document.getElementById('viewCurriculumModal').style.display = 'none';
}

// Toggle status
async function toggleStatus(id) {
    try {
        const response = await fetch(`/api/curriculum/${id}/toggle-status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadCurricula();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Delete curriculum
async function deleteCurriculum(id) {
    if (!confirm('Are you sure you want to delete this curriculum?')) return;

    try {
        const response = await fetch(`/api/curriculum/${id}/delete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            alert('Curriculum deleted successfully');
            loadCurricula();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting curriculum');
    }
}

async function updateCurriculum(curriculumId, selectedSubjects, allSubjects) {
    const unselectedSubjects = allSubjects.filter(id => !selectedSubjects.includes(id));

    for (const subjectId of selectedSubjects) {
        await addSubjectToCurriculum(curriculumId, subjectId);
    }

    for (const subjectId of unselectedSubjects) {
        await removeSubjectFromCurriculum(curriculumId, subjectId);
    }

    alert('Curriculum updated successfully!');
}

async function createCurriculum(formData, selectedSubjects) {
    formData.subjects = selectedSubjects;
    const response = await fetch('/api/curriculum/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Unknown error');
    alert('Curriculum created successfully!');
}
