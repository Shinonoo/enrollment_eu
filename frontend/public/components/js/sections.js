const token = localStorage.getItem('token');
if (!token) window.location.href = '/views/public/login.html';

let currentSectionId = null;
let allSections = [];
let allStudentsData = [];

function toggleStudentFilter() {
    const dropdown = document.getElementById('studentFilterDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function applyStudentFilter() {
    const gradeFilter = document.querySelector('input[name="gradeFilter"]:checked').value;
    const valedictorian = document.getElementById('filterValedictorian').checked;
    const salutatorian = document.getElementById('filterSalutatorian').checked;
    const searchTerm = document.getElementById('searchStudents').value.toLowerCase();

    let filtered = allStudentsData;

    // Filter by grade
    if (gradeFilter !== 'all') {
        filtered = filtered.filter(s => s.current_grade_level == gradeFilter);
    }

    // Filter by search
    if (searchTerm) {
        filtered = filtered.filter(s =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm) ||
            s.student_number.includes(searchTerm)
        );
    }

    displayStudentList(filtered);
}

function filterStudentList() {
    applyStudentFilter();
}

function clearStudentFilter() {
    document.querySelector('input[name="gradeFilter"][value="all"]').checked = true;
    document.getElementById('filterValedictorian').checked = false;
    document.getElementById('filterSalutatorian').checked = false;
    document.getElementById('searchStudents').value = '';
    applyStudentFilter();
    document.getElementById('studentFilterDropdown').style.display = 'none';
}

function toggleSelectAllStudents() {
    const selectAll = document.getElementById('selectAllStudents').checked;
    document.querySelectorAll('.student-checkbox').forEach(cb => {
        cb.checked = selectAll;
    });
}

function displayStudentList(students) {
    const studentList = document.getElementById('studentList');

    if (students.length === 0) {
        studentList.innerHTML = '<p style="text-align: center; color: #999;">No students found</p>';
        return;
    }

    studentList.innerHTML = students.map(student => `
                <label class="student-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #eee; border-radius: 6px; cursor: pointer; transition: background 0.2s;">
                    <input type="checkbox" class="student-checkbox" value="${student.student_id}" style="width: auto;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333;">${student.first_name} ${student.last_name}</div>
                        <small style="color: #999;">${student.student_number} • Grade ${student.current_grade_level}</small>
                    </div>
                </label>
            `).join('');
}

async function openSuccessionModal() {
    try {
        const response = await fetch('http://localhost:3000/api/sections', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const sections = data.sections;
            let html = '';

            // Group sections by grade
            const byGrade = {};
            sections.forEach(s => {
                if (!byGrade[s.grade_level]) byGrade[s.grade_level] = [];
                byGrade[s.grade_level].push(s);
            });

            // Build UI for each grade
            Object.keys(byGrade).sort().forEach(grade => {
                html += `<h3 style="color: #7d1414; margin-top: 30px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #7d1414;">Grade ${grade} Sections</h3>`;

                byGrade[grade].forEach(section => {
                    const nextSection = sections.find(s => s.section_id === section.next_section_id);

                    html += `
                        <div style="border: 2px solid #17a2b8; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: white;">
                            <div style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                                Grade ${section.grade_level} - ${section.section_name}
                            </div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 15px;">
                                School Year: ${section.school_year || '2025-2026'} • Adviser: ${section.adviser_name || 'N/A'}
                            </div>

                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <div style="padding: 8px 16px; border-radius: 8px; border: 2px solid #17a2b8; background: white; font-weight: 600; color: #17a2b8;">
                                    Grade ${section.grade_level} ${section.section_name}
                                </div>
                                <div style="font-size: 24px; color: #17a2b8;">→</div>
                                <div style="padding: 8px 16px; border-radius: 8px; border: 2px solid #17a2b8; background: white; font-weight: 600; color: #17a2b8;">
                                    ${nextSection ? `Grade ${nextSection.grade_level} ${nextSection.section_name}` : 'No Progression'}
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 13px;">Next Section (Year-End Succession)</label>
                                    <select id="nextSection_${section.section_id}" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px;">
                                        <option value="">-- Select Next Section --</option>
                                        ${sections.filter(s => s.grade_level > section.grade_level).map(s =>
                        `<option value="${s.section_id}" ${s.section_id === section.next_section_id ? 'selected' : ''}>
                                                Grade ${s.grade_level} - ${s.section_name}
                                            </option>`
                    ).join('')}
                                    </select>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <button onclick="saveSuccession(${section.section_id})" style="flex: 1; padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Save</button>
                                    <button onclick="clearSuccession(${section.section_id})" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Clear</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });

            document.getElementById('successionModalBody').innerHTML = html;
            document.getElementById('successionModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load succession data');
    }
}

let allSectionsData = []; // Store sections data

async function openSuccessionModal() {
    try {
        const response = await fetch('http://localhost:3000/api/sections', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            allSectionsData = data.sections; // ⭐ STORE FOR LATER USE
            const sections = data.sections;
            let html = '';

            // Group sections by grade
            const byGrade = {};
            sections.forEach(s => {
                if (!byGrade[s.grade_level]) byGrade[s.grade_level] = [];
                byGrade[s.grade_level].push(s);
            });

            // Build UI for each grade
            Object.keys(byGrade).sort().forEach(grade => {
                html += `<h3 style="color: #7d1414; margin-top: 30px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #7d1414;">Grade ${grade} Sections</h3>`;

                byGrade[grade].forEach(section => {
                    const nextSection = sections.find(s => s.section_id === section.next_section_id);

                    html += `
                        <div style="border: 2px solid #17a2b8; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: white;">
                            <div style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                                Grade ${section.grade_level} - ${section.section_name}
                            </div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 15px;">
                                School Year: ${section.school_year || '2025-2026'} • Adviser: ${section.adviser_name || 'N/A'}
                            </div>

                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <div style="padding: 8px 16px; border-radius: 8px; border: 2px solid #17a2b8; background: white; font-weight: 600; color: #17a2b8;">
                                    Grade ${section.grade_level} ${section.section_name}
                                </div>
                                <div style="font-size: 24px; color: #17a2b8;">→</div>
                                <div style="padding: 8px 16px; border-radius: 8px; border: 2px solid #17a2b8; background: white; font-weight: 600; color: #17a2b8;">
                                    ${nextSection ? `Grade ${nextSection.grade_level} ${nextSection.section_name}` : 'No Progression'}
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 13px;">Next Section (Year-End Succession)</label>
                                    <select id="nextSection_${section.section_id}" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px;">
                                        <option value="">-- Select Next Section --</option>
                                        ${sections.filter(s => s.grade_level > section.grade_level).map(s =>
                        `<option value="${s.section_id}" ${s.section_id === section.next_section_id ? 'selected' : ''}>
                                                Grade ${s.grade_level} - ${s.section_name}
                                            </option>`
                    ).join('')}
                                    </select>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <button onclick="saveSuccession(${section.section_id})" style="flex: 1; padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Save</button>
                                    <button onclick="clearSuccession(${section.section_id})" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Clear</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });

            document.getElementById('successionModalBody').innerHTML = html;
            document.getElementById('successionModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load succession data');
    }
}

async function saveSuccession(sectionId) {
    const nextSectionId = document.getElementById(`nextSection_${sectionId}`).value;

    if (!nextSectionId) {
        alert('Please select a next section');
        return;
    }

    const section = allSectionsData.find(s => s.section_id === sectionId);
    if (!section) {
        alert('Section not found');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName: section.section_name,
                schoolLevel: section.school_level,
                gradeLevel: section.grade_level,
                maxCapacity: section.max_capacity || 40,
                nextSectionId: parseInt(nextSectionId)
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Succession saved successfully!');
            setTimeout(() => location.reload(), 300);
        } else {
            alert(data.message || 'Failed to save succession');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function clearSuccession(sectionId) {
    if (!confirm('Clear this section\'s progression?')) return;

    // ⭐ FIND THE SECTION FROM STORED DATA
    const section = allSectionsData.find(s => s.section_id === sectionId);
    if (!section) {
        alert('Section not found');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName: section.section_name,
                schoolLevel: section.school_level,
                gradeLevel: section.grade_level,
                maxCapacity: section.max_capacity || 40,
                nextSectionId: null
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Progression cleared!');
            openSuccessionModal(); // Refresh
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function clearSuccession(sectionId) {
    if (!confirm('Clear this section\'s progression?')) return;

    // ⭐ FIND THE SECTION FROM STORED DATA
    const section = allSectionsData.find(s => s.section_id === sectionId);
    if (!section) {
        alert('Section not found');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName: section.section_name,
                schoolLevel: section.school_level,
                gradeLevel: section.grade_level,
                maxCapacity: section.max_capacity || 40,
                nextSectionId: null
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Progression cleared!');
            openSuccessionModal(); // Refresh
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}


async function loadSections() {
    try {
        const response = await fetch('http://localhost:3000/api/sections', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            allSections = data.sections;
            displaySections(allSections);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('sectionsGrid').innerHTML = '<p>Error loading sections</p>';
    }
}

function displaySections(sections) {
    const grid = document.getElementById('sectionsGrid');
    
    if (!Array.isArray(sections) || sections.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;"><h3>No sections found. Create one to get started!</h3></div>';
        return;
    }
    
    grid.innerHTML = sections.map(section => `
        <div class="section-card">
            <div class="section-card-header">
                <h3>${section.name || 'Unnamed'}</h3>
                <div class="section-actions">
                    <button onclick="editSection(${section.id})" class="icon-btn" title="Edit">✏️</button>
                    <button onclick="deleteSection(${section.id})" class="icon-btn" title="Delete">🗑️</button>
                </div>
            </div>
            
            <div class="section-card-body">
                <p><strong>Grade:</strong> Grade ${section.grade_level}</p>
                <p><strong>Level:</strong> ${section.school_level || 'JHS'}</p>
                <p><strong>School Year:</strong> ${section.school_year || '2025-2026'}</p>
                <p><strong>Capacity:</strong> ${section.current_count || 0} / ${section.max_capacity || 40}</p>
                <p><strong>Adviser:</strong> ${section.adviser || 'Not assigned'}</p>
                <p><strong>Next Section:</strong> ${section.next_section || 'Not set'}</p>
            </div>
            
            <div class="section-card-actions">
                <button onclick="openManageStudentsModal(${section.id})" class="manage-btn">👥 Manage Students</button>
                <button onclick="promoteSection(${section.id})" class="promote-btn" ${!section.next_section ? 'disabled' : ''}>📤 Promote to Set Next Section First</button>
            </div>
        </div>
    `).join('');
}



function filterSections(grade) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    if (grade === 'all') {
        displaySections(allSections);
    } else {
        displaySections(allSections.filter(s => s.grade_level == grade));
    }
}

function openAddSectionModal() {
    document.getElementById('sectionModalTitle').textContent = 'Add New Section';
    document.getElementById('sectionForm').reset();
    currentSectionId = null;
    document.getElementById('sectionModal').classList.add('active');
}

async function saveSection() {
    const sectionName = document.getElementById('sectionName').value;
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const maxCapacity = document.getElementById('maxCapacity').value;

    if (!sectionName || !schoolLevel || !gradeLevel) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const url = currentSectionId
            ? `http://localhost:3000/api/sections/${currentSectionId}`
            : 'http://localhost:3000/api/sections';

        const method = currentSectionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName, schoolLevel, gradeLevel, maxCapacity, schoolYear: '2025-2026'
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const message = currentSectionId ? 'Section updated successfully!' : 'Section created successfully!';
            alert(message);
            closeModal('sectionModal');
            resetSectionForm();

            // ⭐ RELOAD SECTIONS ONLY (smoother)
            loadSections();
        } else {
            alert(data.message || 'Failed to save section');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function editSection(sectionId) {
    try {
        // Fetch section details
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const section = data.section;

            // Populate form with existing data
            document.getElementById('sectionModalTitle').textContent = 'Edit Section';
            document.getElementById('sectionName').value = section.section_name;
            document.getElementById('schoolLevel').value = section.school_level;
            document.getElementById('gradeLevel').value = section.grade_level;
            document.getElementById('maxCapacity').value = section.max_capacity;

            // Store section ID for update
            currentSectionId = sectionId;

            // Change button text
            const submitBtn = document.querySelector('#sectionModal .btn-primary');
            submitBtn.textContent = 'Update Section';

            // Open modal
            document.getElementById('sectionModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load section details');
    }
}

async function viewSection(sectionId) {
    try {
        // Fetch section and students
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const section = data.section;
            const students = data.students || [];

            currentSectionId = sectionId;

            // Populate section info
            document.getElementById('manageStudentsTitle').textContent = `Manage Section: ${section.section_name}`;
            document.getElementById('editSectionName').value = section.section_name;
            document.getElementById('editGradeLevel').value = section.grade_level;
            document.getElementById('editSchoolYear').value = section.school_year || '2025-2026';
            document.getElementById('editAdviser').value = section.adviser_name || '';

            // Load unassigned students
            await loadUnassignedStudents(sectionId, section.grade_level);

            // Display enrolled students
            displayEnrolledStudents(students);

            // Load subjects
            await loadSectionSubjects(sectionId);

            // Open modal
            document.getElementById('manageStudentsModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load section details');
    }
}

async function loadUnassignedStudents(sectionId, gradeLevel) {
    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}/unassigned-students`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            allStudentsData = data.students;
            displayStudentList(allStudentsData);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}


function displayEnrolledStudents(students) {
    const tbody = document.getElementById('enrolledStudentsTableBody');

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No students enrolled yet</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;">${student.student_number}</td>
                        <td style="padding: 12px;">${student.last_name}</td>
                        <td style="padding: 12px;">${student.first_name}</td>
                        <td style="padding: 12px;">${student.middle_name || '-'}</td>
                        <td style="padding: 12px;">${student.email || '-'}</td>
                        <td style="padding: 12px;">${student.phone_number || '-'}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button onclick="removeStudentFromSection(${student.student_id})" 
                                style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Remove
                            </button>
                        </td>
                    </tr>
                `).join('');
}

async function deleteSection(sectionId) {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Section deleted successfully!');
            setTimeout(() => location.reload(), 300);
        } else {
            alert(data.message || 'Failed to delete section');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function saveSectionChanges() {
    try {
        const sectionName = document.getElementById('editSectionName').value;
        const adviser = document.getElementById('editAdviser').value;

        if (!sectionName) {
            alert('Section name is required');
            return;
        }

        // Get selected students
        const selectedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked'))
            .map(cb => parseInt(cb.value));

        // Update section
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName,
                schoolLevel: document.getElementById('editGradeLevel').value,
                gradeLevel: document.getElementById('editGradeLevel').value,
                maxCapacity: 40
            })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Failed to update section');
            return;
        }

        // Assign selected students
        if (selectedStudents.length > 0) {
            for (let studentId of selectedStudents) {
                await fetch('http://localhost:3000/api/students/assign-section', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId,
                        sectionId: currentSectionId,
                        schoolYear: '2025-2026'
                    })
                });
            }
        }

        alert('Section updated successfully!');
        closeModal('manageStudentsModal');

        // ⭐ RELOAD PAGE TO SHOW UPDATED CAPACITY
        setTimeout(() => location.reload(), 500);
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function removeStudentFromSection(studentId) {
    if (!confirm('Remove this student from the section?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student removed successfully!');
            loadSections();
        } else {
            alert(data.message || 'Failed to remove student');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

let currentEnrolledStudents = [];
async function viewEnrolledStudents() {
    try {
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const section = data.section;
            currentEnrolledStudents = data.students || [];

            // Populate section info
            document.getElementById('enrolledStudentsTitle').textContent = `Enrolled Students - ${section.section_name}`;
            document.getElementById('enrolledSectionName').textContent = section.section_name;
            document.getElementById('enrolledGradeLevel').textContent = `Grade ${section.grade_level}`;
            document.getElementById('enrolledStudentCount').textContent = currentEnrolledStudents.length;
            document.getElementById('enrolledAdviser').textContent = section.adviser_name || 'Not assigned';

            // Display students
            displayEnrolledStudentsTable(currentEnrolledStudents);

            // Open modal
            document.getElementById('enrolledStudentsModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load enrolled students');
    }
}

function displayEnrolledStudentsTable(students) {
    const tbody = document.getElementById('enrolledStudentsTableBody');

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No students enrolled</td></tr>';
        return;
    }

    tbody.innerHTML = students.map((student, index) => `
                <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #fafafa;' : ''}">
                    <td style="padding: 12px; font-weight: 600; color: #7d1414;">${student.student_number}</td>
                    <td style="padding: 12px;">${student.last_name}</td>
                    <td style="padding: 12px;">${student.first_name}</td>
                    <td style="padding: 12px;">${student.middle_name || '-'}</td>
                    <td style="padding: 12px;">${student.email || '-'}</td>
                    <td style="padding: 12px;">${student.phone_number || '-'}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="removeEnrolledStudent(${student.student_id})" 
                            style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            Remove
                        </button>
                    </td>
                </tr>
            `).join('');
}

function filterEnrolledStudents() {
    const searchTerm = document.getElementById('searchEnrolledStudents').value.toLowerCase();

    const filtered = currentEnrolledStudents.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm) ||
        student.student_number.toLowerCase().includes(searchTerm)
    );

    displayEnrolledStudentsTable(filtered);
}

async function removeEnrolledStudent(studentId) {
    if (!confirm('Are you sure you want to remove this student from the section?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Student removed successfully!');
            viewEnrolledStudents(); // Refresh the list
        } else {
            alert(data.message || 'Failed to remove student');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}


function exportEnrolledStudents() {
    if (currentEnrolledStudents.length === 0) {
        alert('No students to export');
        return;
    }

    let csv = 'Student Number,Last Name,First Name,Middle Name,Email,Contact\n';

    currentEnrolledStudents.forEach(student => {
        csv += `"${student.student_number}","${student.last_name}","${student.first_name}","${student.middle_name || ''}","${student.email || ''}","${student.phone_number || ''}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `enrolled_students_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function printEnrolledStudents() {
    const sectionName = document.getElementById('enrolledSectionName').textContent;
    const gradeLevel = document.getElementById('enrolledGradeLevel').textContent;
    const adviser = document.getElementById('enrolledAdviser').textContent;

    let printContent = `
                <h2 style="text-align: center; color: #7d1414;">Enrolled Students Report</h2>
                <p><strong>Section:</strong> ${sectionName} | <strong>Grade:</strong> ${gradeLevel} | <strong>Adviser:</strong> ${adviser}</p>
                <p><strong>Total Students:</strong> ${currentEnrolledStudents.length} | <strong>Date Printed:</strong> ${new Date().toLocaleDateString()}</p>
                
                <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead style="background: #7d1414; color: white;">
                        <tr>
                            <th>No.</th>
                            <th>Student Number</th>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Email</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentEnrolledStudents.map((student, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${student.student_number}</td>
                                <td>${student.last_name}</td>
                                <td>${student.first_name}</td>
                                <td>${student.email || '-'}</td>
                                <td>${student.phone_number || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    const printWindow = window.open('', '', 'width=1000,height=600');
    printWindow.document.write('<html><head><title>Print Enrolled Students</title></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

let currentSectionSubjects = [];

async function loadSectionSubjects(sectionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}/subjects`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            currentSectionSubjects = data.subjects || [];
            displaySubjects(currentSectionSubjects);
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        document.getElementById('subjectList').innerHTML = '<p style="text-align: center; color: #999;">No subjects assigned</p>';
    }
}

function displaySubjects(subjects) {
    const subjectList = document.getElementById('subjectList');

    if (subjects.length === 0) {
        subjectList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No subjects assigned yet. Add one to get started!</p>';
        return;
    }

    subjectList.innerHTML = subjects.map(subject => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; background: white; border-radius: 6px; margin-bottom: 8px;">
            <div>
                <div style="font-weight: 600; color: #333; font-size: 14px;">${subject.subject_name || subject}</div>
            </div>
            <button onclick="removeSubjectFromSection('${subject.subject_name || subject}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Remove</button>
        </div>
    `).join('');
}

async function addSubjectToSection() {
    const subjectSelect = document.getElementById('subjectSelect');
    const subject = subjectSelect.value;

    if (!subject) {
        alert('Please select a subject');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}/subjects`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject_name: subject })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Subject added successfully!');
            subjectSelect.value = '';
            loadSectionSubjects(currentSectionId);
        } else {
            alert(data.message || 'Failed to add subject');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function removeSubjectFromSection(subject) {
    if (!confirm('Remove this subject?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${currentSectionId}/subjects`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject_name: subject })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Subject removed successfully!');
            loadSectionSubjects(currentSectionId);
        } else {
            alert(data.message || 'Failed to remove subject');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

async function promoteAllStudents(fromSectionId, toSectionId) {
    const fromSection = allSections.find(s => s.section_id === fromSectionId);
    const toSection = allSections.find(s => s.section_id === toSectionId);

    if (!fromSection || !toSection) {
        alert('Section not found');
        return;
    }

    if (!confirm(`Promote ALL students from ${fromSection.section_name} to ${toSection.section_name}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/sections/${fromSectionId}/promote`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                toSectionId: toSectionId,
                schoolYear: '2025-2026'
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ Success! ${data.studentsPromoted} students promoted`);
            setTimeout(() => location.reload(), 300);
        } else {
            alert(data.message || 'Failed to promote students');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

function resetSectionForm() {
    document.getElementById('sectionModalTitle').textContent = 'Add New Section';
    document.getElementById('sectionForm').reset();
    const submitBtn = document.querySelector('#sectionModal .btn-primary');
    submitBtn.textContent = 'Save Section';
    currentSectionId = null;
}

async function saveSection() {
    const sectionName = document.getElementById('sectionName').value;
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const maxCapacity = document.getElementById('maxCapacity').value;

    if (!sectionName || !schoolLevel || !gradeLevel) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const url = currentSectionId
            ? `http://localhost:3000/api/sections/${currentSectionId}`
            : 'http://localhost:3000/api/sections';

        const method = currentSectionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionName, schoolLevel, gradeLevel, maxCapacity, schoolYear: '2025-2026'
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const message = currentSectionId ? 'Section updated successfully!' : 'Section created successfully!';
            alert(message);
            closeModal('sectionModal');
            resetSectionForm();
            loadSections();
        } else {
            alert(data.message || 'Failed to save section');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

function openAddSectionModal() {
    document.getElementById('sectionModalTitle').textContent = 'Add New Section';
    document.getElementById('sectionForm').reset();
    currentSectionId = null;
    document.getElementById('sectionModal').classList.add('active');
}

async function editSection(sectionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sections/${sectionId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const section = data.section;

            document.getElementById('sectionModalTitle').textContent = 'Edit Section';
            document.getElementById('sectionName').value = section.section_name;
            document.getElementById('schoolLevel').value = section.school_level;
            document.getElementById('gradeLevel').value = section.grade_level;
            document.getElementById('maxCapacity').value = section.max_capacity;

            currentSectionId = sectionId;

            const submitBtn = document.querySelector('#sectionModal .btn-primary');
            submitBtn.textContent = 'Update Section';

            document.getElementById('sectionModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load section details');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}



// Load sections on page load
loadSections();