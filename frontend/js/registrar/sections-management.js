/* ===============================================
   SECTION MANAGEMENT - MAIN JAVASCRIPT
   =============================================== */

// ✅ API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let currentSectionId = null;
let currentSchoolYear = '2025-2026';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Section Management page loaded');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    // Initialize
    loadSections();
    setupEventListeners();
    loadAvailableFaculty();
});

// ===============================================
// EVENT LISTENERS SETUP
// ===============================================
// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Setup grade level filtering
    setupGradeLevelFiltering();
    
    // Filter changes
    const filterSchoolYear = document.getElementById('filterSchoolYear');
    const filterSchoolLevel = document.getElementById('filterSchoolLevel');
    const filterGradeLevel = document.getElementById('filterGradeLevel');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (filterSchoolYear) filterSchoolYear.addEventListener('change', loadSections);
    if (filterSchoolLevel) filterSchoolLevel.addEventListener('change', loadSections);
    if (filterGradeLevel) filterGradeLevel.addEventListener('change', loadSections);

    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', cancelDelete);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', cancelDelete);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            console.log('✅ Confirm delete clicked');
            deleteSection();
        });
    }

    // Create section button
    const createSectionBtn = document.getElementById('createSectionBtn');
    if (createSectionBtn) {
        createSectionBtn.addEventListener('click', () => openSectionModal());
    }

    // Section form submit
    const sectionForm = document.getElementById('sectionForm');
    if (sectionForm) {
        sectionForm.addEventListener('submit', handleSectionSubmit);
    }

    // ✅ MODAL CLOSE BUTTONS - FIXED
    const closeSectionModal = document.getElementById('closeSectionModal');
    const cancelSectionBtn = document.getElementById('cancelSectionBtn');
    if (closeSectionModal) {
        closeSectionModal.addEventListener('click', () => {
            console.log('❌ Close section modal clicked');
            closeModal('sectionModal');
        });
    }
    if (cancelSectionBtn) {
        cancelSectionBtn.addEventListener('click', () => {
            console.log('❌ Cancel section clicked');
            closeModal('sectionModal');
        });
    }

    const closeSectionDetailsModal = document.getElementById('closeSectionDetailsModal');
    if (closeSectionDetailsModal) {
        closeSectionDetailsModal.addEventListener('click', () => {
            console.log('❌ Close details modal clicked');
            closeModal('sectionDetailsModal');
        });
    }

    const closeAddStudentModal = document.getElementById('closeAddStudentModal');
    if (closeAddStudentModal) {
        closeAddStudentModal.addEventListener('click', () => {
            console.log('❌ Close add student modal clicked');
            closeModal('addStudentModal');
        });
    }

    // ✅ CURRICULUM MODAL CLOSE BUTTON - NEW
    const closeSelectCurriculumModal = document.getElementById('closeSelectCurriculumModal');
    if (closeSelectCurriculumModal) {
        closeSelectCurriculumModal.addEventListener('click', () => {
            console.log('❌ Close curriculum modal clicked');
            closeModal('selectCurriculumModal');
        });
    }

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Add student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
    }

    // ✅ SELECT CURRICULUM BUTTON - NEW
    const selectCurriculumBtn = document.getElementById('selectCurriculumBtn');
    if (selectCurriculumBtn) {
        selectCurriculumBtn.addEventListener('click', () => {
            console.log('📚 Select curriculum button clicked');
            openSelectCurriculumModal();
        });
    }

    // ✅ ADD STUDENT MODAL - SEARCH INPUT WITH DEBOUNCE
    const studentSearchInput = document.getElementById('studentSearchInput');
    if (studentSearchInput) {
        let searchTimeout;
        studentSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                console.log('🔍 Searching students...');
                searchAvailableStudentsForSection();
            }, 300);
        });
    }

    // ✅ ADD STUDENT MODAL - FILTER CHECKBOXES
    const excludeValedictorian = document.getElementById('excludeValedictorian');
    if (excludeValedictorian) {
        excludeValedictorian.addEventListener('change', () => {
            console.log('🔄 Filter changed: Exclude Valedictorian');
            searchAvailableStudentsForSection();
        });
    }

    const excludeSalutatorian = document.getElementById('excludeSalutatorian');
    if (excludeSalutatorian) {
        excludeSalutatorian.addEventListener('change', () => {
            console.log('🔄 Filter changed: Exclude Salutatorian');
            searchAvailableStudentsForSection();
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            console.log('❌ Clicked outside modal');
            e.target.classList.remove('active');
            // Also hide modal properly
            e.target.style.display = 'none';
        }
    });
    
    console.log('✅ Event listeners setup complete');
}

// ===============================================
// DATA LOADING FUNCTIONS
// ===============================================

// Get filter parameters
function getFilterParams() {
    const params = {
        school_year: document.getElementById('filterSchoolYear')?.value || '',
        school_level: document.getElementById('filterSchoolLevel')?.value || '',
        grade_level: document.getElementById('filterGradeLevel')?.value || ''
    };
    
    console.log('🔍 Filter params:', params);
    return params;
}


// Load sections
// Get filter parameters - FIXED VERSION
function getFilterParams() {
    const params = {
        school_year: document.getElementById('filterSchoolYear')?.value || '',
        school_level: document.getElementById('filterSchoolLevel')?.value || '',
        grade_level: document.getElementById('filterGradeLevel')?.value || '',
        is_active: document.getElementById('filterStatus')?.value || ''
    };
    
    console.log('🔍 Filter params:', params);
    return params;
}

// Load sections - WITH BETTER LOGGING
async function loadSections() {
    try {
        const params = getFilterParams();
        
        // Remove empty parameters
        const cleanParams = {};
        Object.keys(params).forEach(key => {
            if (params[key] !== '') {
                cleanParams[key] = params[key];
            }
        });
        
        const queryString = new URLSearchParams(cleanParams).toString();
        const url = `${API_BASE_URL}/api/sections${queryString ? '?' + queryString : ''}`;
        
        console.log('📡 Fetching sections from:', url);
        console.log('📦 Filter params:', cleanParams);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch sections');
        }

        const data = await response.json();
        console.log('✅ Sections loaded:', data.sections?.length || 0);
        console.log('📋 Sections data:', data.sections);
        
        displaySections(data.sections || []);
    } catch (error) {
        console.error('❌ Error loading sections:', error);
        showError('Failed to load sections. ' + error.message);
        
        // Show empty state
        const sectionsGrid = document.getElementById('sectionsGrid');
        if (sectionsGrid) {
            sectionsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load sections</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

// Display sections
// Helper function to get full school level name
function getSchoolLevelDisplay(level) {
    const levelMap = {
        'JHS': 'Junior High School',
        'SHS': 'Senior High School',
        'Elementary': 'Elementary'
    };
    return levelMap[level] || level;
}

// Update displaySections function
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
        const capacity = section.enrolled_students || 0;
        const maxCapacity = section.max_capacity || 40;
        const percentage = (capacity / maxCapacity) * 100;
        const capacityClass = percentage >= 100 ? 'full' : percentage >= 80 ? 'near-full' : '';
        
        return `
            <div class="section-card" onclick="manageSection(${section.section_id})">
                <div class="section-card-header">
                    <h3 class="section-name">${section.section_name}</h3>
                </div>
                
                <div class="section-info">
                    <div class="section-info-item">
                        <i class="fas fa-school"></i>
                        <span><strong>Level:</strong> ${getSchoolLevelDisplay(section.school_level)}</span>
                    </div>
                    <div class="section-info-item">
                        <i class="fas fa-layer-group"></i>
                        <span><strong>Grade:</strong> Grade ${section.grade_level}</span>
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
                        <div class="capacity-fill ${capacityClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
                
                <!-- ✅ SIMPLIFIED: Single "Manage" button -->
                <div class="section-actions" onclick="event.stopPropagation()">
                    <button class="action-btn action-btn-manage" onclick="event.stopPropagation(); manageSection(${section.section_id})">
                        <i class="fas fa-cog"></i>
                        Manage
                    </button>
                    <button class="action-btn action-btn-delete" onclick="event.stopPropagation(); confirmDeleteSection(${section.section_id}, '${section.section_name}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// Load available faculty
async function loadAvailableFaculty() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/faculty/available`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load faculty');

        const data = await response.json();
        const select = document.getElementById('adviserSelect');
        
        if (select) {
            select.innerHTML = '<option value="">No Adviser Assigned</option>' +
                data.faculty.map(f => 
                    `<option value="${f.faculty_id}">${f.first_name} ${f.last_name}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('❌ Error loading faculty:', error);
    }
}

// ===============================================
// MODAL FUNCTIONS
// ===============================================

// Open section modal (create/edit)
// Open section modal (create/edit) - UPDATED
function openSectionModal(sectionId = null) {
    console.log('📂 Opening section modal, ID:', sectionId);
    
    const modal = document.getElementById('sectionModal');
    const form = document.getElementById('sectionForm');
    const title = document.getElementById('sectionModalTitle');
    
    if (!modal || !form || !title) {
        console.error('❌ Modal elements not found');
        return;
    }
    
    // Reset form
    form.reset();
    
    // Reset grade level options
    updateGradeLevelOptions('schoolLevel', 'gradeLevel', false);
    
    // Hide strand by default
    const strandGroup = document.getElementById('strand')?.closest('.form-group');
    if (strandGroup) {
        strandGroup.style.display = 'none';
    }
    
    if (sectionId) {
        console.log('📝 Edit mode - loading section data...');
        title.textContent = 'Edit Section';
        const sectionIdInput = document.getElementById('sectionId');
        if (sectionIdInput) {
            sectionIdInput.value = sectionId;
        }
        loadSectionData(sectionId);
    } else {
        console.log('➕ Create mode - new section');
        title.textContent = 'Create New Section';
        const sectionIdInput = document.getElementById('sectionId');
        const schoolYearInput = document.getElementById('schoolYear');
        if (sectionIdInput) sectionIdInput.value = '';
        if (schoolYearInput) schoolYearInput.value = currentSchoolYear;
    }
    
    // Show modal
    modal.classList.add('active');
    console.log('✅ Modal opened');
}


// Update displaySectionDetails with null checks
function displaySectionDetails(section) {
    const setTextContent = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    setTextContent('sectionDetailsTitle', section.section_name);
    setTextContent('sectionDetailsSubtitle', `${section.school_level} - Grade ${section.grade_level}`);
    setTextContent('detailSchoolLevel', section.school_level);
    setTextContent('detailGradeLevel', `Grade ${section.grade_level}`);
    setTextContent('detailStrand', section.strand || 'N/A');
    setTextContent('detailAdviser', section.adviser_first_name ? 
        `${section.adviser_first_name} ${section.adviser_last_name}` : 'Not Assigned');
    setTextContent('detailCapacity', `${section.current_capacity || 0} / ${section.max_capacity}`);
    setTextContent('detailSchoolYear', section.school_year);
    
    displayStudents(section.students || []);
    displaySubjects(section.subjects || []);
}


// Load section data for editing
// Load section data for editing
async function loadSectionData(sectionId) {
    try {
        console.log('📝 Loading section data for ID:', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error response:', errorData);
            throw new Error('Failed to load section');
        }

        const data = await response.json();
        console.log('✅ Section data loaded:', data);
        const section = data.section;

        // Check if form elements exist
        const elements = {
            sectionId: document.getElementById('sectionId'),
            sectionName: document.getElementById('sectionName'),
            schoolYear: document.getElementById('schoolYear'),
            schoolLevel: document.getElementById('schoolLevel'),
            gradeLevel: document.getElementById('gradeLevel'),
            strand: document.getElementById('strand'),
            maxCapacity: document.getElementById('maxCapacity'),
            adviserSelect: document.getElementById('adviserSelect')
        };

        // Log missing elements
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`❌ Missing element: ${key}`);
            }
        });

        // Populate form
        if (elements.sectionId) elements.sectionId.value = section.section_id;
        if (elements.sectionName) elements.sectionName.value = section.section_name;
        if (elements.schoolYear) elements.schoolYear.value = section.school_year;
        if (elements.schoolLevel) elements.schoolLevel.value = section.school_level;
        if (elements.gradeLevel) elements.gradeLevel.value = section.grade_level;
        if (elements.strand) elements.strand.value = section.strand || '';
        if (elements.maxCapacity) elements.maxCapacity.value = section.max_capacity;
        if (elements.adviserSelect) elements.adviserSelect.value = section.adviser_id || '';

        console.log('✅ Form populated successfully');
    } catch (error) {
        console.error('❌ Error loading section:', error);
        showError('Failed to load section data: ' + error.message);
    }
}


// Handle section form submit
// Handle section form submit - WITH DETAILED LOGGING
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
        const url = sectionId ? `${API_BASE_URL}/api/sections/${sectionId}` : `${API_BASE_URL}/api/sections`;
        const method = sectionId ? 'PUT' : 'POST';

        console.log('💾 Submitting section form...');
        console.log('🎯 URL:', url);
        console.log('🔧 Method:', method);
        console.log('📦 Data:', formData);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Server error:', error);
            throw new Error(error.message || 'Failed to save section');
        }

        const data = await response.json();
        console.log('✅ Success response:', data);
        
        showSuccess(data.message || 'Section saved successfully!');
        closeModal('sectionModal');
        loadSections(); // Reload the sections list
        
        console.log('✅ Section saved and modal closed');
    } catch (error) {
        console.error('❌ Error saving section:', error);
        showError('Failed to save section: ' + error.message);
    }
}

// Edit section
function editSection(sectionId) {
    console.log('✏️ Editing section:', sectionId);
    
    // Close all modals first
    closeAllModals();
    
    // Wait a bit for modals to close
    setTimeout(() => {
        openSectionModal(sectionId);
    }, 100);
}

// Close modal helper function
function closeModal(modalId) {
    console.log('🔒 Closing modal:', modalId);
    
    const modal = document.getElementById(modalId);
    
    if (!modal) {
        console.error('❌ Modal not found:', modalId);
        return;
    }
    
    // Remove active class
    modal.classList.remove('active');
    
    // Hide the modal
    modal.style.display = 'none';
    
    console.log('✅ Modal closed:', modalId);
}


// Close all modals helper function
function closeAllModals() {
    console.log('🔒 Closing all modals');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ===============================================
// SECTION OPERATIONS
// ===============================================

function editSection(sectionId) {
    openSectionModal(sectionId);
}

// View section details
async function viewSectionDetails(sectionId) {
    console.log('👁️ Viewing section:', sectionId);
    currentSectionId = sectionId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}`, {
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
        console.error('❌ Error loading section details:', error);
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
    console.log('📑 Switching to tab:', tabName);
    
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}


// Open add student modal
async function openAddStudentModal() {
    if (!currentSectionId) {
        console.error('❌ No section selected');
        return;
    }
    
    console.log('📝 Opening add student modal for section:', currentSectionId);
    
    const modal = document.getElementById('addStudentModal');
    
    console.log('🔍 Modal element:', modal);
    console.log('🔍 Modal current display:', modal ? modal.style.display : 'modal not found');
    console.log('🔍 Modal classes:', modal ? modal.className : 'modal not found');
    
    if (!modal) {
        console.error('❌ Add student modal not found in DOM');
        console.log('Available modals:', document.querySelectorAll('.modal'));
        return;
    }
    
    // Show modal - try multiple approaches
    modal.style.display = 'flex'; // For flex layout
    modal.classList.add('active'); // For class-based styling
    
    console.log('✅ Modal display set to:', modal.style.display);
    
    // Clear previous search
    const searchInput = document.getElementById('studentSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear results
    const resultsContainer = document.getElementById('studentSearchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Search for students to add to this section</p>
            </div>
        `;
    }
    
    // Uncheck filters
    const excludeVal = document.getElementById('excludeValedictorian');
    const excludeSal = document.getElementById('excludeSalutatorian');
    if (excludeVal) excludeVal.checked = false;
    if (excludeSal) excludeSal.checked = false;
    
    // Auto-load initial results
    console.log('🔍 Loading initial student list...');
    await searchAvailableStudentsForSection();
}



// Search students
async function searchStudents(query = '', schoolLevel = '', gradeLevel = '') {
    try {
        const currentSchoolYear = document.getElementById('filterSchoolYear').value || '2025-2026';
        
        const params = new URLSearchParams({
            query: query,
            school_year: currentSchoolYear,
            school_level: schoolLevel,
            grade_level: gradeLevel
        });
        
        console.log('🔍 Searching students:', params.toString());
        
        const response = await fetch(`${API_BASE_URL}/api/sections/students/search?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAvailableStudents(data.students);
        } else {
            console.error('❌ Failed to search students:', data.message);
        }
    } catch (error) {
        console.error('❌ Error searching students:', error);
    }
}

function displayAvailableStudents(students) {
    const container = document.getElementById('available-students-list');
    
    if (!students || students.length === 0) {
        container.innerHTML = '<p class="no-data">No available students found</p>';
        return;
    }
    
    container.innerHTML = students.map(student => `
        <div class="student-item" onclick="selectStudent(${student.student_id})">
            <div class="student-info">
                <strong>${student.student_number}</strong>
                <span>${student.last_name}, ${student.first_name} ${student.middle_name || ''}</span>
                <span class="badge">${student.school_level} - Grade ${student.current_grade_level}</span>
                ${student.current_section_id ? '<span class="badge warning">Already in section</span>' : ''}
                ${student.is_valedictorian ? '<span class="badge success">Valedictorian</span>' : ''}
                ${student.is_salutatorian ? '<span class="badge success">Salutatorian</span>' : ''}
            </div>
        </div>
    `).join('');
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

// Add student to section
async function addStudentToSection(studentId) {
    try {
        const modal = document.getElementById('add-student-modal');
        const sectionId = modal.dataset.sectionId;
        const currentSchoolYear = document.getElementById('filterSchoolYear').value || '2025-2026';
        
        console.log('➕ Adding student', studentId, 'to section', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                student_id: studentId,
                school_year: currentSchoolYear,
                enrollment_date: new Date().toISOString().split('T')[0]
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Student added successfully');
            
            // Close modal
            modal.style.display = 'none';
            
            // Reload students list
            await loadStudentsForSection(sectionId);
            
            // Show success message
            showToast('Student added successfully!', 'success');
        } else {
            console.error('❌ Failed to add student:', data.message);
            showToast(data.message || 'Failed to add student', 'error');
        }
    } catch (error) {
        console.error('❌ Error adding student:', error);
        showToast('Error adding student to section', 'error');
    }
}

// Helper function for toast notifications
function showToast(message, type = 'info') {
    // Implement your toast notification here
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message); // Replace with actual toast UI
}

// Remove student from section
async function removeStudent(studentId) {
    if (!confirm('Are you sure you want to remove this student from the section?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to remove student');

        showSuccess('Student removed from section successfully!');
        viewSectionDetails(currentSectionId);
        loadSections();
    } catch (error) {
        console.error('❌ Error removing student:', error);
        showError('Failed to remove student from section.');
    }
}


// Open add subject modal
async function openAddSubjectModal() {
    if (!currentSectionId) {
        console.error('❌ No section selected');
        return;
    }
    
    console.log('📚 Opening add subject modal for section:', currentSectionId);
    
    const modal = document.getElementById('addSubjectModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Load available subjects from curriculum
    await loadAvailableSubjects();
}

async function loadAvailableSubjects() {
    try {
        if (!currentSectionId) {
            console.error('❌ No section selected');
            return;
        }
        
        console.log('📚 Loading available subjects for section:', currentSectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/subjects/available`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAvailableSubjects(data.subjects);
        } else {
            console.error('❌ Failed to load available subjects:', data.message);
        }
    } catch (error) {
        console.error('❌ Error loading available subjects:', error);
    }
}   

function displayAvailableSubjects(subjects) {
console.log('📊 Displaying', subjects.length, 'subjects');
    console.log('🔍 Looking for container: availableSubjectsList');
    
    const container = document.getElementById('availableSubjectsList');
    console.log('📦 Container found:', container);
    
    if (!container) {
        console.error('❌ Container element not found! Check your HTML.');
        console.log('Available elements:', document.querySelectorAll('[id*="subject"]'));
        return;
    }    
    if (!subjects || subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No subjects available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = subjects.map(subject => {
        const isAdded = subject.already_added === 1;
        
        return `
            <div class="subject-item ${isAdded ? 'disabled' : ''}" 
                 ${!isAdded ? `onclick="confirmAddSubject('${subject.subject_name.replace(/'/g, "\\'")}', '${subject.subject_code || ''}')"` : ''}>
                <div class="subject-info">
                    <div class="subject-main">
                        <strong>${subject.subject_code || 'N/A'}</strong>
                        <span class="subject-name">${subject.subject_name}</span>
                    </div>
                    <div class="subject-badges">
                        ${isAdded ? '<span class="badge badge-warning">Already Added</span>' : '<span class="badge badge-success">Available</span>'}
                    </div>
                </div>
                ${!isAdded ? '<i class="fas fa-plus-circle add-icon"></i>' : ''}
            </div>
        `;
    }).join('');
}



function confirmAddSubject(subjectName, subjectCode) {
    const confirmAdd = confirm(`Add ${subjectName} (${subjectCode}) to this section?`);
    if (confirmAdd) {
        addSubjectToSectionFromModal(subjectName);
    }
}

async function addSubjectToSectionFromModal(subjectName) {
    try {
        if (!currentSectionId) {
            console.error('❌ No section selected');
            return;
        }
        
        console.log('➕ Adding subject to section:', subjectName);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/subjects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                subject_name: subjectName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Subject added successfully');
            
            // Close modal
            document.getElementById('addSubjectModal').style.display = 'none';
            
            // Reload subjects list
            await loadSubjectsForSection(currentSectionId);
            
            // Reload available subjects
            await loadAvailableSubjects();
            
            showSuccess('Subject added successfully!');
        } else {
            console.error('❌ Failed to add subject:', data.message);
            showError(data.message || 'Failed to add subject');
        }
    } catch (error) {
        console.error('❌ Error adding subject:', error);
        showError('Error adding subject to section');
    }
}

// Handle add subject
async function handleAddSubject(e) {
    e.preventDefault();
    console.log('➕ Adding subject');
    
    const subjectName = document.getElementById('subjectName').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/subjects`, {
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
        console.error('❌ Error adding subject:', error);
        showError('Failed to add subject.');
    }
}

// Remove subject
async function removeSubject(subjectId) {
    if (!confirm('Are you sure you want to remove this subject?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to remove subject');

        showSuccess('Subject removed successfully!');
        viewSectionDetails(currentSectionId);
    } catch (error) {
        console.error('❌ Error removing subject:', error);
        showError('Failed to remove subject.');
    }
}

async function handleAddSubject(e) {
    e.preventDefault();
    console.log('➕ Adding subject');
    // Implementation here
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function showError(message) {
    console.error('❌', message);
    alert('Error: ' + message);
}

function showSuccess(message) {
    console.log('✅', message);
    alert(message);
}

// Missing function aliases
function openAddSectionModal() {
    openSectionModal();
}

function filterSections() {
    loadSections();
}

function openSuccessionModal() {
    alert('Section succession feature coming soon!');
}

// ===============================================
// DYNAMIC GRADE LEVEL FILTERING - COMPLETE FIXED VERSION
// ===============================================

// Define grade levels for each school level
const GRADE_LEVELS = {
    'JHS': [
        { value: '7', label: 'Grade 7' },
        { value: '8', label: 'Grade 8' },
        { value: '9', label: 'Grade 9' },
        { value: '10', label: 'Grade 10' }
    ],
    'SHS': [
        { value: '11', label: 'Grade 11' },
        { value: '12', label: 'Grade 12' }
    ]
};

// Helper function to get full school level name for display
function getSchoolLevelDisplay(level) {
    const levelMap = {
        'JHS': 'Junior High School',
        'SHS': 'Senior High School'
    };
    return levelMap[level] || level;
}

// Update grade level options based on selected school level
function updateGradeLevelOptions(schoolLevelSelectId, gradeLevelSelectId, includeAllOption = false) {
    const schoolLevelSelect = document.getElementById(schoolLevelSelectId);
    const gradeLevelSelect = document.getElementById(gradeLevelSelectId);
    
    if (!schoolLevelSelect || !gradeLevelSelect) {
        console.error('❌ Select elements not found:', { schoolLevelSelectId, gradeLevelSelectId });
        return;
    }
    
    const selectedLevel = schoolLevelSelect.value;
    console.log('📝 Updating grade levels for:', selectedLevel);
    
    // Clear current options
    gradeLevelSelect.innerHTML = '';
    
    // Add "All Grades" option for filters
    if (includeAllOption) {
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Grades';
        gradeLevelSelect.appendChild(allOption);
    } else {
        // Add "Select Grade" option for forms
        const selectOption = document.createElement('option');
        selectOption.value = '';
        selectOption.textContent = 'Select Grade';
        gradeLevelSelect.appendChild(selectOption);
    }
    
    // If no level selected, show all grades
    if (!selectedLevel || selectedLevel === '') {
        const allGrades = [
            ...GRADE_LEVELS['JHS'],
            ...GRADE_LEVELS['SHS']
        ];
        allGrades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.value;
            option.textContent = grade.label;
            gradeLevelSelect.appendChild(option);
        });
        console.log('✅ Loaded all grades (no filter)');
        return;
    }
    
    // Add grade levels for selected school level
    const grades = GRADE_LEVELS[selectedLevel] || [];
    
    if (grades.length === 0) {
        console.warn('⚠️ No grades found for level:', selectedLevel);
        return;
    }
    
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.value;
        option.textContent = grade.label;
        gradeLevelSelect.appendChild(option);
    });
    
    console.log(`✅ Updated grade levels for ${selectedLevel}:`, grades.length, 'grades');
}

// Initialize grade level filtering
function setupGradeLevelFiltering() {
    console.log('🔧 Setting up grade level filtering...');
    
    // For filter dropdowns
    const filterSchoolLevel = document.getElementById('filterSchoolLevel');
    if (filterSchoolLevel) {
        updateGradeLevelOptions('filterSchoolLevel', 'filterGradeLevel', true);
        filterSchoolLevel.addEventListener('change', () => {
            console.log('🔄 Filter school level changed');
            updateGradeLevelOptions('filterSchoolLevel', 'filterGradeLevel', true);
        });
    }
    
    // For create modal (may not exist until opened)
    const modalSchoolLevel = document.getElementById('schoolLevel');
    if (modalSchoolLevel) {
        modalSchoolLevel.addEventListener('change', () => {
            console.log('🔄 Modal school level changed');
            updateGradeLevelOptions('schoolLevel', 'gradeLevel', false);
            updateStrandVisibility();
        });
    }
    
    console.log('✅ Grade level filtering setup complete');
}


// Show/hide strand field based on school level - UPDATED
function updateStrandVisibility() {
    const schoolLevelSelect = document.getElementById('schoolLevel');
    const strandGroup = document.getElementById('strand')?.closest('.form-group-modern');
    
    if (!schoolLevelSelect || !strandGroup) return;
    
    const selectedLevel = schoolLevelSelect.value;
    
    // Show strand only for SHS
    if (selectedLevel === 'SHS') {
        strandGroup.style.display = 'block';
        document.getElementById('strand').required = true;
        console.log('✅ Strand field shown (SHS)');
    } else {
        strandGroup.style.display = 'none';
        document.getElementById('strand').required = false;
        document.getElementById('strand').value = '';
        console.log('✅ Strand field hidden (JHS)');
    }
}


// ===============================================
// DELETE SECTION FUNCTIONALITY
// ===============================================

let sectionToDelete = null;

// Show delete confirmation modal
function confirmDeleteSection(sectionId, sectionName) {
    console.log('🗑️ Confirming delete for section:', sectionId, sectionName);
    
    sectionToDelete = sectionId;
    
    // Update modal content
    const sectionNameSpan = document.getElementById('deleteSectionName');
    if (sectionNameSpan) {
        sectionNameSpan.textContent = sectionName;
    }
    
    // Show modal
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Delete section after confirmation
async function deleteSection() {
    if (!sectionToDelete) {
        console.error('❌ No section to delete');
        return;
    }
    
    try {
        console.log('🗑️ Deleting section:', sectionToDelete);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Server error:', error);
            throw new Error(error.message || 'Failed to delete section');
        }

        const data = await response.json();
        console.log('✅ Success response:', data);
        
        showSuccess('Section deleted successfully!');
        
        // Close modal
        closeModal('deleteConfirmModal');
        
        // Reset
        sectionToDelete = null;
        
        // Reload sections
        loadSections();
        
    } catch (error) {
        console.error('❌ Error deleting section:', error);
        showError('Failed to delete section: ' + error.message);
    }
}

// Cancel delete
function cancelDelete() {
    console.log('❌ Delete cancelled');
    sectionToDelete = null;
    closeModal('deleteConfirmModal');
}

// ===============================================
// UNIFIED MANAGE SECTION FUNCTION
// ===============================================

// Open manage section modal
async function manageSection(sectionId) {
    console.log('⚙️ Managing section:', sectionId);
    
    currentSectionId = sectionId;
    
    try {
        // Load section data
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to load section');

        const data = await response.json();
        const section = data.section;
        
        // Update modal title
        document.getElementById('manageSectionTitle').textContent = section.section_name;
        document.getElementById('manageSectionSubtitle').textContent = 
            `${getSchoolLevelDisplay(section.school_level)} - Grade ${section.grade_level}`;
        
        // Populate edit form
        populateEditForm(section);
        
        // Load students and subjects
        loadStudentsForSection(sectionId);
        loadSubjectsForSection(sectionId);
        
        // Show modal
        document.getElementById('manageSectionModal').classList.add('active');
        
        // Switch to details tab by default
        switchManageTab('details');
        
    } catch (error) {
        console.error('❌ Error loading section:', error);
        showError('Failed to load section details.');
    }
}

// Switch between tabs in manage modal
function switchManageTab(tabName) {
    console.log('📑 Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn-modern').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content-modern').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Populate edit form with section data
function populateEditForm(section) {
    document.getElementById('editSectionId').value = section.section_id;
    document.getElementById('editSectionName').value = section.section_name;
    document.getElementById('editSchoolYear').value = section.school_year;
    document.getElementById('editSchoolLevel').value = section.school_level;
    document.getElementById('editMaxCapacity').value = section.max_capacity;
    document.getElementById('editAdviserSelect').value = section.adviser_id || '';
    
    // Update grade level options
    updateGradeLevelOptions('editSchoolLevel', 'editGradeLevel', false);
    document.getElementById('editGradeLevel').value = section.grade_level;
    
    // Update strand
    if (section.strand) {
        document.getElementById('editStrand').value = section.strand;
    }
    
    // Show/hide strand
    updateEditStrandVisibility();
}

// Update strand visibility for edit form
function updateEditStrandVisibility() {
    const schoolLevelSelect = document.getElementById('editSchoolLevel');
    const strandGroup = document.getElementById('editStrandGroup');
    
    if (!schoolLevelSelect || !strandGroup) return;
    
    const selectedLevel = schoolLevelSelect.value;
    
    if (selectedLevel === 'SHS') {
        strandGroup.style.display = 'block';
        document.getElementById('editStrand').required = true;
    } else {
        strandGroup.style.display = 'none';
        document.getElementById('editStrand').required = false;
        document.getElementById('editStrand').value = '';
    }
}

// In setupEventListeners, add:

// Close manage modal
const closeManageSectionModal = document.getElementById('closeManageSectionModal');
if (closeManageSectionModal) {
    closeManageSectionModal.addEventListener('click', () => {
        closeModal('manageSectionModal');
    });
}

// Edit section form in manage modal
const editSectionForm = document.getElementById('editSectionForm');
if (editSectionForm) {
    editSectionForm.addEventListener('submit', handleEditSectionSubmit);
}

// Edit school level change
const editSchoolLevel = document.getElementById('editSchoolLevel');
if (editSchoolLevel) {
    editSchoolLevel.addEventListener('change', () => {
        updateGradeLevelOptions('editSchoolLevel', 'editGradeLevel', false);
        updateEditStrandVisibility();
    });
}

// Add student from manage modal
const addStudentBtnManage = document.getElementById('addStudentBtnManage');
if (addStudentBtnManage) {
    addStudentBtnManage.addEventListener('click', openAddStudentModal);
}

// Add subject from manage modal
const addSubjectBtnManage = document.getElementById('addSubjectBtnManage');
if (addSubjectBtnManage) {
    addSubjectBtnManage.addEventListener('click', openAddSubjectModal);
}

// ===============================================
// MISSING FUNCTIONS FOR MANAGE SECTION MODAL
// ===============================================

// Handle edit section form submit
async function handleEditSectionSubmit(e) {
    e.preventDefault();
    
    const sectionId = document.getElementById('editSectionId').value;
    const formData = {
        section_name: document.getElementById('editSectionName').value,
        school_year: document.getElementById('editSchoolYear').value,
        school_level: document.getElementById('editSchoolLevel').value,
        grade_level: document.getElementById('editGradeLevel').value,
        strand: document.getElementById('editStrand').value || null,
        max_capacity: parseInt(document.getElementById('editMaxCapacity').value),
        adviser_id: document.getElementById('editAdviserSelect').value || null
    };

    try {
        const url = `${API_BASE_URL}/api/sections/${sectionId}`;
        const method = 'PUT';

        console.log('💾 Updating section:', sectionId);
        console.log('📦 Data:', formData);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Server error:', error);
            throw new Error(error.message || 'Failed to update section');
        }

        const data = await response.json();
        console.log('✅ Success response:', data);
        
        showSuccess(data.message || 'Section updated successfully!');
        
        // Reload sections list
        loadSections();
        
        // Update modal title
        const newTitle = formData.section_name;
        document.getElementById('manageSectionTitle').textContent = newTitle;
        
        console.log('✅ Section updated successfully');
    } catch (error) {
        console.error('❌ Error updating section:', error);
        showError('Failed to update section: ' + error.message);
    }
}

// Load students for a specific section
async function loadStudentsForSection(sectionId) {
    try {
        console.log('📚 Loading students for section:', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}/students`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            console.error('❌ Failed to load students');
            displayStudentsInManage([]);
            return;
        }

        const data = await response.json();
        console.log('✅ Students loaded:', data.students?.length || 0);
        
        displayStudentsInManage(data.students || []);
    } catch (error) {
        console.error('❌ Error loading students:', error);
        displayStudentsInManage([]);
    }
}

// Display students in manage modal
function displayStudentsInManage(students) {
    const tbody = document.getElementById('studentsTableBodyManage');
    
    if (!tbody) {
        console.error('❌ studentsTableBodyManage not found');
        return;
    }
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--gray-dark);">
                    <i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 12px; opacity: 0.5;"></i>
                    No students enrolled in this section
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.student_number || 'N/A'}</td>
            <td>${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}</td>
            <td>
                <span class="status-badge status-enrolled">Enrolled</span>
                ${student.is_valedictorian ? '<span class="status-badge status-valedictorian">Valedictorian</span>' : ''}
                ${student.is_salutatorian ? '<span class="status-badge status-salutatorian">Salutatorian</span>' : ''}
            </td>
            <td>${student.enrolled_date ? new Date(student.enrolled_date).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="icon-btn icon-btn-delete" onclick="removeStudentFromManage(${student.student_id})" title="Remove student">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Remove student from section (in manage modal)
async function removeStudentFromManage(studentId) {
    if (!confirm('Are you sure you want to remove this student from the section?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to remove student');

        showSuccess('Student removed from section successfully!');
        
        // Reload students in modal
        loadStudentsForSection(currentSectionId);
        
        // Reload sections list to update count
        loadSections();
    } catch (error) {
        console.error('❌ Error removing student:', error);
        showError('Failed to remove student from section.');
    }
}

// Load subjects for a specific section
async function loadSubjectsForSection(sectionId) {
    try {
        console.log('📖 Loading subjects for section:', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}/subjects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            console.error('❌ Failed to load subjects');
            displaySubjectsInManage([]);
            return;
        }

        const data = await response.json();
        console.log('✅ Subjects loaded:', data.subjects?.length || 0);
        
        displaySubjectsInManage(data.subjects || []);
    } catch (error) {
        console.error('❌ Error loading subjects:', error);
        displaySubjectsInManage([]);
    }
}

// Display subjects in manage modal
function displaySubjectsInManage(subjects) {
    const subjectsList = document.getElementById('subjectsListManage');
    
    if (!subjectsList) {
        console.error('❌ subjectsListManage not found');
        return;
    }
    
    if (!subjects || subjects.length === 0) {
        subjectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No subjects assigned to this section</p>
            </div>
        `;
        return;
    }

    subjectsList.innerHTML = subjects.map(subject => `
        <div class="subject-card-modern">
            <div class="subject-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="subject-info">
                <h4>${subject.subject_name || 'Unnamed Subject'}</h4>
                <p>${subject.subject_code || 'No code'}</p>
            </div>
            <button class="icon-btn icon-btn-delete" onclick="removeSubjectFromManage(${subject.subject_id})" title="Remove subject">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Remove subject from section (in manage modal)
async function removeSubjectFromManage(subjectId) {
    if (!confirm('Are you sure you want to remove this subject?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to remove subject');

        showSuccess('Subject removed successfully!');
        
        // Reload subjects in modal
        loadSubjectsForSection(currentSectionId);
    } catch (error) {
        console.error('❌ Error removing subject:', error);
        showError('Failed to remove subject.');
    }
}

// Search available students for adding to section
async function searchAvailableStudentsForSection() {
    try {
        if (!currentSectionId) {
            console.error('❌ No section selected');
            return;
        }
        
        const query = document.getElementById('studentSearchInput').value;
        const currentSchoolYear = document.getElementById('filterSchoolYear')?.value || '2025-2026';
        const excludeVal = document.getElementById('excludeValedictorian').checked;
        const excludeSal = document.getElementById('excludeSalutatorian').checked;
        
        // Get current section details to filter by school level and grade
        const sectionResponse = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const sectionData = await sectionResponse.json();
        const section = sectionData.section;
        
        const params = new URLSearchParams({
            query: query,
            school_year: currentSchoolYear,
            school_level: section.school_level,
            grade_level: section.grade_level,
            exclude_valedictorian: excludeVal,
            exclude_salutatorian: excludeSal
        });
        
        console.log('🔍 Searching students with:', params.toString());
        
        const response = await fetch(`${API_BASE_URL}/api/sections/students/search?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayStudentSearchResults(data.students);
        } else {
            console.error('❌ Failed to search students:', data.message);
        }
    } catch (error) {
        console.error('❌ Error searching students:', error);
        document.getElementById('studentSearchResults').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading students. Please try again.</p>
            </div>
        `;
    }
}

// Display student search results in add student modal
function displayStudentSearchResults(students) {
    const container = document.getElementById('studentSearchResults');
    
    if (!students || students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>No available students found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = students.map(student => {
        const fullName = `${student.last_name}, ${student.first_name} ${student.middle_name || ''}`.trim();
        const isInSection = student.current_section_id !== null;
        
        return `
            <div class="student-search-item ${isInSection ? 'disabled' : ''}" 
                 ${!isInSection ? `onclick="confirmAddStudent(${student.student_id}, '${fullName.replace(/'/g, "\\'")}')"` : ''}>
                <div class="student-info">
                    <div class="student-main">
                        <strong>${student.student_number}</strong>
                        <span class="student-name">${fullName}</span>
                    </div>
                    <div class="student-badges">
                        <span class="badge badge-info">${student.school_level} - Grade ${student.current_grade_level}</span>
                        ${student.strand ? `<span class="badge badge-secondary">${student.strand}</span>` : ''}
                        ${isInSection ? '<span class="badge badge-warning">Already in section</span>' : ''}
                        ${student.is_valedictorian ? '<span class="badge badge-success">Valedictorian</span>' : ''}
                        ${student.is_salutatorian ? '<span class="badge badge-success">Salutatorian</span>' : ''}
                    </div>
                </div>
                ${!isInSection ? '<i class="fas fa-plus-circle add-icon"></i>' : ''}
            </div>
        `;
    }).join('');
}

// Confirm adding student
function confirmAddStudent(studentId, studentName) {
    const confirmAdd = confirm(`Add ${studentName} to this section?`);
    if (confirmAdd) {
        addStudentToSectionFromModal(studentId);
    }
}

// Add student to section from modal
async function addStudentToSectionFromModal(studentId) {
    try {
        if (!currentSectionId) {
            console.error('❌ No section selected');
            return;
        }
        
        const currentSchoolYear = document.getElementById('filterSchoolYear')?.value || '2025-2026';
        
        console.log('➕ Adding student', studentId, 'to section', currentSectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                student_id: studentId,
                school_year: currentSchoolYear,
                enrollment_date: new Date().toISOString().split('T')[0]
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Student added successfully');
            
            // Close modal
            document.getElementById('addStudentModal').style.display = 'none';
            
            // Reload students list in manage modal
            await loadStudentsForSection(currentSectionId);
            
            // Reload sections to update count
            await loadSections();
            
            // Show success message
            showSuccess('Student added successfully!');
        } else {
            console.error('❌ Failed to add student:', data.message);
            showError(data.message || 'Failed to add student');
        }
    } catch (error) {
        console.error('❌ Error adding student:', error);
        showError('Error adding student to section');
    }
}

// Load section curriculum and display subjects
async function loadSectionCurriculum(sectionId) {
    try {
        console.log('📚 Loading curriculum for section:', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}/curriculum/subjects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayCurriculumSubjects(data.subjects);
        } else {
            console.error('❌ Failed to load curriculum subjects');
        }
    } catch (error) {
        console.error('❌ Error loading curriculum:', error);
    }
}

// ============================================
// CURRICULUM MANAGEMENT
// ============================================

// Open curriculum selection modal
async function openSelectCurriculumModal() {
    if (!currentSectionId) {
        console.error('❌ No section selected');
        return;
    }
    
    console.log('📚 Opening curriculum selection for section:', currentSectionId);
    
    const modal = document.getElementById('selectCurriculumModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Load available curricula
    await loadAvailableCurricula();
}

// Load available curricula for section
async function loadAvailableCurricula() {
    try {
        console.log('📚 Loading available curricula for section:', currentSectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/curricula/available`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAvailableCurricula(data.curricula, data.current_curriculum_id);
        } else {
            console.error('❌ Failed to load curricula');
        }
    } catch (error) {
        console.error('❌ Error loading curricula:', error);
    }
}

// Display available curricula
function displayAvailableCurricula(curricula, currentCurriculumId) {
    const container = document.getElementById('curriculaList');
    
    if (!container) {
        console.error('❌ Curricula list container not found');
        return;
    }
    
    if (!curricula || curricula.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-dead"></i>
                <p>No curricula available for this section's grade level</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curricula.map(curriculum => {
        const isCurrent = curriculum.curriculum_id === currentCurriculumId;
        
        return `
            <div class="curriculum-item ${isCurrent ? 'current' : ''}" 
                 onclick="${isCurrent ? '' : `selectCurriculum(${curriculum.curriculum_id}, '${curriculum.curriculum_name.replace(/'/g, "\\'")}')`}">
                <div class="curriculum-info">
                    <div class="curriculum-main">
                        <strong>${curriculum.curriculum_name}</strong>
                        <span class="curriculum-details">
                            ${curriculum.school_level} - Grade ${curriculum.grade_level}
                            ${curriculum.strand ? ` (${curriculum.strand})` : ''}
                        </span>
                    </div>
                    <div class="curriculum-meta">
                        <span class="badge badge-info">${curriculum.subject_count} subjects</span>
                        <span class="badge badge-secondary">SY ${curriculum.school_year}</span>
                        ${isCurrent ? '<span class="badge badge-success">Current</span>' : ''}
                    </div>
                </div>
                ${!isCurrent ? '<i class="fas fa-check-circle select-icon"></i>' : ''}
            </div>
        `;
    }).join('');
}

// Select and assign curriculum
async function selectCurriculum(curriculumId, curriculumName) {
    const confirmAssign = confirm(
        `Assign "${curriculumName}" curriculum to this section?\n\n` +
        `All subjects from this curriculum will be assigned to the section.`
    );
    
    if (!confirmAssign) return;
    
    try {
        console.log('📚 Assigning curriculum:', curriculumId, 'to section:', currentSectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${currentSectionId}/curriculum`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                curriculum_id: curriculumId  // Make sure this is being sent
            })
        });
        
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
            console.log('✅ Curriculum assigned successfully');
            
            // Close modal
            document.getElementById('selectCurriculumModal').style.display = 'none';
            
            // Reload subjects from curriculum
            await loadSubjectsForSection(currentSectionId);
            
            alert('Curriculum assigned successfully!');
        } else {
            console.error('❌ Failed to assign curriculum:', data.message);
            alert(data.message || 'Failed to assign curriculum');
        }
    } catch (error) {
        console.error('❌ Error assigning curriculum:', error);
        alert('Error assigning curriculum');
    }
}

// Load subjects from curriculum (update existing function)
async function loadSubjectsForSection(sectionId) {
    try {
        console.log('📖 Loading subjects from curriculum for section:', sectionId);
        
        const response = await fetch(`${API_BASE_URL}/api/sections/${sectionId}/curriculum/subjects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayCurriculumSubjects(data.subjects);
        } else {
            console.error('❌ Failed to load subjects');
        }
    } catch (error) {
        console.error('❌ Error loading subjects:', error);
    }
}

// Display curriculum subjects (read-only)
function displayCurriculumSubjects(subjects) {
    const container = document.getElementById('sectionSubjectsList');
    
    if (!container) {
        console.error('❌ Subjects container not found');
        return;
    }
    
    if (!subjects || subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No curriculum assigned to this section</p>
                <button class="btn btn-primary" onclick="openSelectCurriculumModal()">
                    <i class="fas fa-book-open"></i> Select Curriculum
                </button>
            </div>
        `;
        return;
    }
    
    // Show curriculum info at top
    const curriculumName = subjects[0]?.curriculum_name || 'Unknown';
    
    container.innerHTML = `
        <div class="curriculum-header">
            <div class="curriculum-info">
                <i class="fas fa-book-open"></i>
                <span><strong>Curriculum:</strong> ${curriculumName}</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="openSelectCurriculumModal()">
                <i class="fas fa-exchange-alt"></i> Change Curriculum
            </button>
        </div>
        
        <div class="subjects-grid">
            ${subjects.map(subject => `
                <div class="subject-card">
                    <div class="subject-header">
                        <strong>${subject.subject_code || 'N/A'}</strong>
                        ${subject.is_required ? '<span class="badge badge-danger">Required</span>' : '<span class="badge badge-secondary">Elective</span>'}
                    </div>
                    <div class="subject-name">${subject.subject_name}</div>
                    <div class="subject-meta">
                        ${subject.semester !== 'Both' ? `<span class="badge badge-info">Semester ${subject.semester}</span>` : '<span class="badge badge-info">Full Year</span>'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}



console.log('✅ Section Management JavaScript loaded');
