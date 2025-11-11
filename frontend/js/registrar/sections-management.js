/* ===============================================
   SECTION MANAGEMENT - MAIN JAVASCRIPT
   =============================================== */

// Global variables
let currentSectionId = null;
let currentSchoolYear = '2025-2026';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSections();
    setupEventListeners();
    loadAvailableFaculty();
});

// Setup event listeners
function setupEventListeners() {
    // Filter changes
    const filterSchoolYear = document.getElementById('filterSchoolYear');
    const filterSchoolLevel = document.getElementById('filterSchoolLevel');
    const filterGradeLevel = document.getElementById('filterGradeLevel');
    const filterStatus = document.getElementById('filterStatus');

    if (filterSchoolYear) filterSchoolYear.addEventListener('change', loadSections);
    if (filterSchoolLevel) filterSchoolLevel.addEventListener('change', loadSections);
    if (filterGradeLevel) filterGradeLevel.addEventListener('change', loadSections);
    if (filterStatus) filterStatus.addEventListener('change', loadSections);

    // Create section button
    const createSectionBtn = document.getElementById('createSectionBtn');
    if (createSectionBtn) {
        createSectionBtn.addEventListener('click', () => {
            openSectionModal();
        });
    }

    // Section form submit
    const sectionForm = document.getElementById('sectionForm');
    if (sectionForm) {
        sectionForm.addEventListener('submit', handleSectionSubmit);
    }

    // Modal close buttons
    const closeSectionModal = document.getElementById('closeSectionModal');
    const cancelSectionBtn = document.getElementById('cancelSectionBtn');
    if (closeSectionModal) closeSectionModal.addEventListener('click', () => closeModal('sectionModal'));
    if (cancelSectionBtn) cancelSectionBtn.addEventListener('click', () => closeModal('sectionModal'));

    const closeSectionDetailsModal = document.getElementById('closeSectionDetailsModal');
    if (closeSectionDetailsModal) {
        closeSectionDetailsModal.addEventListener('click', () => closeModal('sectionDetailsModal'));
    }

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Add student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
    }

    // Add subject button
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', openAddSubjectModal);
    }

    // Student search
    const studentSearchInput = document.getElementById('studentSearchInput');
    if (studentSearchInput) {
        let searchTimeout;
        studentSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchStudents(e.target.value);
            }, 300);
        });
    }

    // Search filters
    const excludeValedictorian = document.getElementById('excludeValedictorian');
    const excludeSalutatorian = document.getElementById('excludeSalutatorian');
    if (excludeValedictorian) excludeValedictorian.addEventListener('change', () => {
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput && searchInput.value) {
            searchStudents(searchInput.value);
        }
    });
    if (excludeSalutatorian) excludeSalutatorian.addEventListener('change', () => {
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput && searchInput.value) {
            searchStudents(searchInput.value);
        }
    });

    // Close add student modal
    const closeAddStudentModal = document.getElementById('closeAddStudentModal');
    if (closeAddStudentModal) {
        closeAddStudentModal.addEventListener('click', () => closeModal('addStudentModal'));
    }

    // Add subject form
    const addSubjectForm = document.getElementById('addSubjectForm');
    if (addSubjectForm) {
        addSubjectForm.addEventListener('submit', handleAddSubject);
    }

    const closeAddSubjectModal = document.getElementById('closeAddSubjectModal');
    const cancelSubjectBtn = document.getElementById('cancelSubjectBtn');
    if (closeAddSubjectModal) closeAddSubjectModal.addEventListener('click', () => closeModal('addSubjectModal'));
    if (cancelSubjectBtn) cancelSubjectBtn.addEventListener('click', () => closeModal('addSubjectModal'));

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Get filter parameters
function getFilterParams() {
    return {
        school_year: document.getElementById('filterSchoolYear')?.value || '',
        school_level: document.getElementById('filterSchoolLevel')?.value || '',
        grade_level: document.getElementById('filterGradeLevel')?.value || '',
        is_active: document.getElementById('filterStatus')?.value || ''
    };
}

// Load sections
async function loadSections() {
    try {
        const params = getFilterParams();
        const queryString = new URLSearchParams(params).toString();
        
        const response = await fetch(`/api/sections?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load sections');

        const data = await response.json();
        displaySections(data.sections);
    } catch (error) {
        console.error('Error loading sections:', error);
        showError('Failed to load sections. Please try again.');
    }
}

// Display sections
function displaySections(sections) {
    const sectionsGrid = document.getElementById('sectionsGrid');
    
    if (!sections || sections.length === 0) {
        sectionsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No sections found</p>
            </div>
        `;
        return;
    }

    sectionsGrid.innerHTML = sections.map(section => {
        const capacity = section.current_capacity || 0;
        const maxCapacity = section.max_capacity || 40;
        const percentage = (capacity / maxCapacity) * 100;
        const capacityClass = percentage >= 100 ? 'full' : percentage >= 80 ? 'near-full' : '';
        
        return `
            <div class="section-card" onclick="viewSectionDetails(${section.section_id})">
                <div class="section-card-header">
                    <h3 class="section-name">${section.section_name}</h3>
                    <span class="section-badge badge-${section.is_active ? 'active' : 'inactive'}">
                        ${section.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                
                <div class="section-info">
                    <div class="section-info-item">
                        <i class="fas fa-school"></i>
                        <span><strong>Level:</strong> ${section.school_level}</span>
                    </div>
                    <div class="section-info-item">
                        <i class="fas fa-layer-group"></i>
                        <span><strong>Grade:</strong> ${section.grade_level}</span>
                    </div>
                    ${section.strand ? `
                        <div class="section-info-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span><strong>Strand:</strong> ${section.strand}</span>
                        </div>
                    ` : ''}
                    <div class="section-info-item">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span><strong>Adviser:</strong> ${section.adviser_first_name ? 
                            `${section.adviser_first_name} ${section.adviser_last_name}` : 
                            'Not Assigned'}</span>
                    </div>
                    <div class="section-info-item">
                        <i class="fas fa-calendar"></i>
                        <span><strong>S.Y.:</strong> ${section.school_year}</span>
                    </div>
                </div>
                
                <div class="section-capacity">
                    <div class="capacity-text">
                        <span>Students Enrolled</span>
                        <strong>${capacity} / ${maxCapacity}</strong>
                    </div>
                    <div class="capacity-bar">
                        <div class="capacity-fill ${capacityClass}" style="width: ${percentage}%"></div>
                    </div>
                </div>
                
                <div class="section-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="editSection(${section.section_id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="action-btn" onclick="viewSectionDetails(${section.section_id})">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open section modal (create/edit)
function openSectionModal(sectionId = null) {
    const modal = document.getElementById('sectionModal');
    const form = document.getElementById('sectionForm');
    const title = document.getElementById('sectionModalTitle');
    
    form.reset();
    
    if (sectionId) {
        title.textContent = 'Edit Section';
        loadSectionData(sectionId);
    } else {
        title.textContent = 'Create New Section';
        document.getElementById('sectionId').value = '';
        document.getElementById('schoolYear').value = currentSchoolYear;
    }
    
    modal.classList.add('active');
}

// Load section data for editing
async function loadSectionData(sectionId) {
    try {
        const response = await fetch(`/api/sections/${sectionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load section');

        const data = await response.json();
        const section = data.section;

        document.getElementById('sectionId').value = section.section_id;
        document.getElementById('sectionName').value = section.section_name;
        document.getElementById('schoolYear').value = section.school_year;
        document.getElementById('schoolLevel').value = section.school_level;
        document.getElementById('gradeLevel').value = section.grade_level;
        document.getElementById('strand').value = section.strand || '';
        document.getElementById('maxCapacity').value = section.max_capacity;
        document.getElementById('adviserSelect').value = section.adviser_id || '';
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load section data.');
    }
}

// Handle section form submit
async function handleSectionSubmit(e) {
    e.preventDefault();
    
    const sectionId = document.getElementById('sectionId').value;
    const formData = {
        section_name: document.getElementById('sectionName').value,
        school_year: document.getElementById('schoolYear').value,
        school_level: document.getElementById('schoolLevel').value,
        grade_level: document.getElementById('gradeLevel').value,
        strand: document.getElementById('strand').value || null,
        max_capacity: parseInt(document.getElementById('maxCapacity').value),
        adviser_id: document.getElementById('adviserSelect').value || null,
        is_active: 1
    };

    try {
        const url = sectionId ? `/api/sections/${sectionId}` : '/api/sections';
        const method = sectionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save section');

        const data = await response.json();
        showSuccess(data.message);
        closeModal('sectionModal');
        loadSections();
    } catch (error) {
        console.error('Error saving section:', error);
        showError('Failed to save section. Please try again.');
    }
}

// Edit section
function editSection(sectionId) {
    openSectionModal(sectionId);
}

// View section details
async function viewSectionDetails(sectionId) {
    currentSectionId = sectionId;
    
    try {
        const response = await fetch(`/api/sections/${sectionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load section details');

        const data = await response.json();
        displaySectionDetails(data.section);
        
        const modal = document.getElementById('sectionDetailsModal');
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading section details:', error);
        showError('Failed to load section details.');
    }
}

// Display section details
function displaySectionDetails(section) {
    document.getElementById('sectionDetailsTitle').textContent = section.section_name;
    document.getElementById('sectionDetailsSubtitle').textContent = `${section.school_level} - Grade ${section.grade_level}`;
    
    document.getElementById('detailSchoolLevel').textContent = section.school_level;
    document.getElementById('detailGradeLevel').textContent = `Grade ${section.grade_level}`;
    document.getElementById('detailStrand').textContent = section.strand || 'N/A';
    document.getElementById('detailAdviser').textContent = section.adviser_first_name ? 
        `${section.adviser_first_name} ${section.adviser_last_name}` : 'Not Assigned';
    document.getElementById('detailCapacity').textContent = 
        `${section.current_capacity || 0} / ${section.max_capacity}`;
    document.getElementById('detailSchoolYear').textContent = section.school_year;
    
    displayStudents(section.students || []);
    displaySubjects(section.subjects || []);
}

// Display students in section
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No students enrolled</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.student_number}</td>
            <td>${student.first_name} ${student.middle_name || ''} ${student.last_name}</td>
            <td>
                <span class="status-badge status-enrolled">Enrolled</span>
                ${student.is_valedictorian ? '<span class="status-badge status-valedictorian">Valedictorian</span>' : ''}
                ${student.is_salutatorian ? '<span class="status-badge status-salutatorian">Salutatorian</span>' : ''}
            </td>
            <td>${new Date(student.enrolled_date).toLocaleDateString()}</td>
            <td>
                <button class="icon-btn icon-btn-delete" onclick="removeStudent(${student.student_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Display subjects
function displaySubjects(subjects) {
    const subjectsList = document.getElementById('subjectsList');
    
    if (!subjects || subjects.length === 0) {
        subjectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No subjects assigned</p>
            </div>
        `;
        return;
    }

    subjectsList.innerHTML = subjects.map(subject => `
        <div class="subject-card">
            <span class="subject-name">${subject.subject_name}</span>
            <div class="subject-actions">
                <button class="icon-btn icon-btn-delete" onclick="removeSubject(${subject.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Switch tabs
function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-button').classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Open add student modal
function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    const searchInput = document.getElementById('studentSearchInput');
    const resultsDiv = document.getElementById('studentSearchResults');
    
    searchInput.value = '';
    resultsDiv.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>Search for students to add to this section</p>
        </div>
    `;
    
    modal.classList.add('active');
}

// Search students
async function searchStudents(query) {
    const resultsDiv = document.getElementById('studentSearchResults');
    
    if (!query || query.length < 2) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Type at least 2 characters to search</p>
            </div>
        `;
        return;
    }

    try {
        const excludeValedictorian = document.getElementById('excludeValedictorian').checked;
        const excludeSalutatorian = document.getElementById('excludeSalutatorian').checked;
        const section = await getCurrentSectionInfo();
        
        const params = new URLSearchParams({
            query,
            school_year: section.school_year,
            school_level: section.school_level,
            grade_level: section.grade_level,
            exclude_valedictorian: excludeValedictorian,
            exclude_salutatorian: excludeSalutatorian
        });

        const response = await fetch(`/api/sections/students/search?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        displaySearchResults(data.students);
    } catch (error) {
        console.error('Error searching students:', error);
        showError('Failed to search students.');
    }
}

// Display search results
function displaySearchResults(students) {
    const resultsDiv = document.getElementById('studentSearchResults');
    
    if (!students || students.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>No students found</p>
            </div>
        `;
        return;
    }

    resultsDiv.innerHTML = students.map(student => {
        const alreadyEnrolled = student.current_section_id != null;
        
        return `
            <div class="student-result-item">
                <div class="student-result-info">
                    <h4>${student.first_name} ${student.middle_name || ''} ${student.last_name}</h4>
                    <p><strong>Student #:</strong> ${student.student_number}</p>
                    <p><strong>Grade:</strong> ${student.current_grade_level} ${student.strand ? `- ${student.strand}` : ''}</p>
                    ${alreadyEnrolled ? '<p style="color: #dc3545;"><strong>Already enrolled in another section</strong></p>' : ''}
                    <div class="student-badges">
                        ${student.is_valedictorian ? '<span class="status-badge status-valedictorian">Valedictorian</span>' : ''}
                        ${student.is_salutatorian ? '<span class="status-badge status-salutatorian">Salutatorian</span>' : ''}
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" 
                    onclick="addStudentToSection(${student.student_id})"
                    ${alreadyEnrolled ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                    Add
                </button>
            </div>
        `;
    }).join('');
}

// Get current section info
async function getCurrentSectionInfo() {
    const response = await fetch(`/api/sections/${currentSectionId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    return data.section;
}

// Add student to section
async function addStudentToSection(studentId) {
    try {
        const section = await getCurrentSectionInfo();
        
        const response = await fetch(`/api/sections/${currentSectionId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                student_id: studentId,
                school_year: section.school_year,
                enrollment_date: new Date().toISOString().split('T')[0]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        showSuccess('Student added to section successfully!');
        closeModal('addStudentModal');
        viewSectionDetails(currentSectionId);
        loadSections();
    } catch (error) {
        console.error('Error adding student:', error);
        showError(error.message || 'Failed to add student to section.');
    }
}

// Remove student from section
async function removeStudent(studentId) {
    if (!confirm('Are you sure you want to remove this student from the section?')) return;

    try {
        const response = await fetch(`/api/sections/${currentSectionId}/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to remove student');

        showSuccess('Student removed from section successfully!');
        viewSectionDetails(currentSectionId);
        loadSections();
    } catch (error) {
        console.error('Error removing student:', error);
        showError('Failed to remove student from section.');
    }
}

// Open add subject modal
function openAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    const form = document.getElementById('addSubjectForm');
    form.reset();
    modal.classList.add('active');
}

// Handle add subject
async function handleAddSubject(e) {
    e.preventDefault();
    
    const subjectName = document.getElementById('subjectName').value;

    try {
        const response = await fetch(`/api/sections/${currentSectionId}/subjects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ subject_name: subjectName })
        });

        if (!response.ok) throw new Error('Failed to add subject');

        showSuccess('Subject added successfully!');
        closeModal('addSubjectModal');
        viewSectionDetails(currentSectionId);
    } catch (error) {
        console.error('Error adding subject:', error);
        showError('Failed to add subject.');
    }
}

// Remove subject
async function removeSubject(subjectId) {
    if (!confirm('Are you sure you want to remove this subject?')) return;

    try {
        const response = await fetch(`/api/sections/${currentSectionId}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to remove subject');

        showSuccess('Subject removed successfully!');
        viewSectionDetails(currentSectionId);
    } catch (error) {
        console.error('Error removing subject:', error);
        showError('Failed to remove subject.');
    }
}

// Load available faculty
async function loadAvailableFaculty() {
    try {
        const response = await fetch('/api/sections/faculty/available', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load faculty');

        const data = await response.json();
        const select = document.getElementById('adviserSelect');
        
        select.innerHTML = '<option value="">No Adviser Assigned</option>' +
            data.faculty.map(f => 
                `<option value="${f.faculty_id}">${f.first_name} ${f.last_name}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading faculty:', error);
    }
}

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function showSuccess(message) {
    alert(message); // Replace with better notification system
}

function showError(message) {
    alert(message); // Replace with better notification system
}
