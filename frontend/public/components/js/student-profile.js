// STUDENT PROFILE PAGE LOGIC
const token = localStorage.getItem('token');
let searchTimeout;
let currentStudent = null;

function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadStudents();
    }, 500);
}

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/students/statistics', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const stats = data.statistics;
            document.getElementById('totalStudents').textContent = stats.total || 0;
            document.getElementById('enrolledStudents').textContent = stats.enrolled || 0;
            document.getElementById('jhsStudents').textContent = stats.jhs || 0;
            document.getElementById('shsStudents').textContent = stats.shs || 0;
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

async function loadStudents() {
    const search = document.getElementById('searchInput').value;
    const level = document.getElementById('filterLevel').value;
    const grade = document.getElementById('filterGrade').value;
    const status = document.getElementById('filterStatus').value;
    const type = document.getElementById('filterType').value;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('studentsTable').style.display = 'none';

    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('schoolLevel', level);
        if (grade) params.append('gradeLevel', grade);
        if (status) params.append('enrollmentStatus', status);
        if (type) params.append('studentType', type);

        const response = await fetch('http://localhost:3000/api/students?' + params.toString(), {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();
        document.getElementById('loading').style.display = 'none';

        if (response.ok && data.success) {
            if (data.students.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayStudents(data.students);
            }
        } else {
            alert('Failed to load students');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Connection error');
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        const date = new Date(student.enrolled_at).toLocaleDateString();

        row.innerHTML = `
            <td><strong>${student.student_number}</strong></td>
            <td>${student.first_name} ${student.last_name}</td>
            <td><span class="badge badge-${student.school_level.toLowerCase()}">${student.school_level}</span></td>
            <td>Grade ${student.current_grade_level}</td>
            <td>${student.student_type}</td>
            <td><span class="badge badge-${student.enrollment_status}">${student.enrollment_status}</span></td>
            <td>${date}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="viewStudent(${student.student_id})" class="btn btn-primary btn-sm">View</button>
                    <button onclick="editStudent(${student.student_id})" class="btn btn-sm" style="background: #667eea; color: white;">Edit</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('studentsTable').style.display = 'table';
}

async function viewStudent(id) {
    try {
        const modal = document.getElementById('detailsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('modalContent').innerHTML = '<p style="text-align: center; padding: 2rem;">Loading...</p>';

        const response = await fetch(`http://localhost:3000/api/students/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentStudent = data.student;
            displayStudentDetails(data.student);
        } else {
            document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Failed to load student details</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('modalContent').innerHTML = '<p style="color: red; text-align: center;">Connection error</p>';
    }
}

function displayStudentDetails(student) {
    const enrolled = new Date(student.enrolled_at).toLocaleString();
    const dob = new Date(student.date_of_birth).toLocaleDateString();
    const section = student.section_name || 'Not Assigned';
    
    let honorsHTML = '';
    if (student.is_valedictorian || student.is_salutatorian) {
        honorsHTML = `<div class="detail-section">
            <h3>🏆 Academic Honors</h3>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${student.is_valedictorian ? `<span class="badge" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333; font-weight: 700;">👑 Valedictorian</span>` : ''}
                ${student.is_salutatorian ? `<span class="badge" style="background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%); color: white; font-weight: 700;">🥈 Salutatorian</span>` : ''}
            </div>
        </div>`;
    }
    
    document.getElementById('modalContent').innerHTML = `
        ${honorsHTML}

        <div class="detail-section">
            <h3>👤 Personal Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Full Name:</strong>
                    <span>${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}</span>
                </div>
                <div class="detail-item">
                    <strong>Date of Birth:</strong>
                    <span>${dob}</span>
                </div>
                <div class="detail-item">
                    <strong>Gender:</strong>
                    <span>${student.gender}</span>
                </div>
                <div class="detail-item">
                    <strong>Email:</strong>
                    <span>${student.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${student.phone_number || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Age:</strong>
                    <span>${student.age || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>🎓 Student Information</h3>
            <div class="info-box detail-grid">
                <div><strong>Student Number:</strong> ${student.student_number}</div>
                <div><strong>Status:</strong> <span class="badge badge-${student.enrollment_status}">${student.enrollment_status}</span></div>
                <div><strong>Enrolled:</strong> ${enrolled}</div>
                <div><strong>Type:</strong> ${student.student_type}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>📚 Academic Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>LRN:</strong>
                    <span>${student.lrn || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>School Level:</strong>
                    <span class="badge badge-${student.school_level.toLowerCase()}">${student.school_level}</span>
                </div>
                <div class="detail-item">
                    <strong>Current Grade:</strong>
                    <span>Grade ${student.current_grade_level}</span>
                </div>
                <div class="detail-item">
                    <strong>Section:</strong>
                    <span><strong style="color: #8B1425;">${section}</strong></span>
                </div>
                <div class="detail-item">
                    <strong>School Year:</strong>
                    <span>${student.school_year}</span>
                </div>
                ${student.strand ? `<div class="detail-item">
                    <strong>Strand:</strong>
                    <span>${student.strand}</span>
                </div>` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h3>ℹ️ Civil Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Nationality:</strong>
                    <span>${student.nationality || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Citizenship:</strong>
                    <span>${student.citizenship || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Religion:</strong>
                    <span>${student.religion || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>External Name:</strong>
                    <span>${student.ext_name || 'N/A'}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <strong>Previous School:</strong>
                    <span>${student.previous_school || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>📍 Address</h3>
            <div class="detail-grid">
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <strong>Street:</strong>
                    <span>${student.street || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Barangay:</strong>
                    <span>${student.barangay || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>City:</strong>
                    <span>${student.city || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Province:</strong>
                    <span>${student.province || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Zip Code:</strong>
                    <span>${student.zip_code || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>👨‍👩‍👧 Guardian Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Name:</strong>
                    <span>${student.guardian_name}</span>
                </div>
                <div class="detail-item">
                    <strong>Relationship:</strong>
                    <span>${student.guardian_relationship}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${student.guardian_phone}</span>
                </div>
                <div class="detail-item">
                    <strong>Email:</strong>
                    <span>${student.guardian_email || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Hide Save button for view mode
    document.getElementById('saveBtn').style.display = 'none';
}


function showEditModal(student) {
    const modal = document.getElementById('detailsModal');
    const section = student.section_name || 'Not Assigned';
    const isValedictorian = student.is_valedictorian ? 'checked' : '';
    const isSalutatorian = student.is_salutatorian ? 'checked' : '';
    
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <form id="editForm" onsubmit="saveStudent(event)" style="max-height: calc(100vh - 300px); overflow-y: auto; padding-right: 1rem;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">🎓 Academic Information</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>LRN</label>
                    <input type="text" value="${student.lrn || ''}" id="lrn" maxlength="12" placeholder="12-digit LRN" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> School Level</label>
                    <select id="schoolLevel" required style="padding: 0.5rem; font-size: 0.85rem;">
                        <option value="JHS" ${student.school_level === 'JHS' ? 'selected' : ''}>JHS</option>
                        <option value="SHS" ${student.school_level === 'SHS' ? 'selected' : ''}>SHS</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Grade</label>
                    <select id="gradeLevel" required style="padding: 0.5rem; font-size: 0.85rem;">
                        <option value="7" ${student.current_grade_level == 7 ? 'selected' : ''}>Grade 7</option>
                        <option value="8" ${student.current_grade_level == 8 ? 'selected' : ''}>Grade 8</option>
                        <option value="9" ${student.current_grade_level == 9 ? 'selected' : ''}>Grade 9</option>
                        <option value="10" ${student.current_grade_level == 10 ? 'selected' : ''}>Grade 10</option>
                        <option value="11" ${student.current_grade_level == 11 ? 'selected' : ''}>Grade 11</option>
                        <option value="12" ${student.current_grade_level == 12 ? 'selected' : ''}>Grade 12</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Type</label>
                    <select id="studentType" required style="padding: 0.5rem; font-size: 0.85rem;">
                        <option value="regular" ${student.student_type === 'regular' ? 'selected' : ''}>Regular</option>
                        <option value="irregular" ${student.student_type === 'irregular' ? 'selected' : ''}>Irregular</option>
                        <option value="transferee" ${student.student_type === 'transferee' ? 'selected' : ''}>Transferee</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Status</label>
                    <select id="status" required style="padding: 0.5rem; font-size: 0.85rem;">
                        <option value="enrolled" ${student.enrollment_status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                        <option value="completed" ${student.enrollment_status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="transferred_out" ${student.enrollment_status === 'transferred_out' ? 'selected' : ''}>Transferred</option>
                        <option value="dropped" ${student.enrollment_status === 'dropped' ? 'selected' : ''}>Dropped</option>
                        <option value="graduated" ${student.enrollment_status === 'graduated' ? 'selected' : ''}>Graduated</option>
                    </select>
                </div>
                ${student.school_level === 'SHS' ? `<div class="form-group">
                    <label>Strand</label>
                    <select id="strand" style="padding: 0.5rem; font-size: 0.85rem;">
                        <option value="">Select</option>
                        <option value="STEM" ${student.strand === 'STEM' ? 'selected' : ''}>STEM</option>
                        <option value="ABM" ${student.strand === 'ABM' ? 'selected' : ''}>ABM</option>
                        <option value="HUMSS" ${student.strand === 'HUMSS' ? 'selected' : ''}>HUMSS</option>
                        <option value="ARTS" ${student.strand === 'ARTS' ? 'selected' : ''}>ARTS</option>
                    </select>
                </div>` : ''}
            </div>

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">👤 Personal Information</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> First Name</label>
                    <input type="text" value="${student.first_name}" id="firstName" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
                <div class="form-group">
                    <label>Middle Name</label>
                    <input type="text" value="${student.middle_name || ''}" id="middleName" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Last Name</label>
                    <input type="text" value="${student.last_name}" id="lastName" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
                <div class="form-group">
                    <label>Suffix</label>
                    <input type="text" value="${student.suffix || ''}" id="suffix" placeholder="Jr., Sr." style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Date of Birth</label>
                    <input type="date" value="${student.date_of_birth ? student.date_of_birth.split('T')[0] : ''}" id="dob" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Gender</label>
                    <select id="gender" style="padding: 0.4rem; font-size: 0.85rem;" required>
                        <option value="">Select</option>
                        <option value="Male" ${student.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${student.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${student.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" value="${student.age || ''}" id="age" min="0" max="120" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${student.email || ''}" id="email" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" value="${student.phone_number || ''}" id="phone" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">ℹ️ Civil Information</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Nationality</label>
                    <input type="text" value="${student.nationality || ''}" id="nationality" placeholder="Filipino" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label>Citizenship</label>
                    <input type="text" value="${student.citizenship || ''}" id="citizenship" placeholder="Filipino" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Religion</label>
                    <input type="text" value="${student.religion || ''}" id="religion" placeholder="Catholic" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>External Name</label>
                    <input type="text" value="${student.ext_name || ''}" id="extName" placeholder="Nickname" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label>Previous School</label>
                    <input type="text" value="${student.previous_school || ''}" id="previousSchool" style="padding: 0.4rem; font-size: 0.85rem;">
                </div>
            </div>

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">📍 Address</h4>

            <div class="form-group" style="margin-bottom: 0.75rem;">
                <label><span style="color: #ef4444; font-weight: 700;">*</span> Street</label>
                <input type="text" value="${student.street || ''}" id="street" placeholder="House No., Street" style="padding: 0.4rem; font-size: 0.85rem;" required>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
                <label><span style="color: #ef4444; font-weight: 700;">*</span> Barangay</label>
                <input type="text" value="${student.barangay || ''}" id="barangay" style="padding: 0.4rem; font-size: 0.85rem;" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> City</label>
                    <input type="text" value="${student.city || ''}" id="city" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Province</label>
                    <input type="text" value="${student.province || ''}" id="province" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
            </div>

            <div class="form-group">
                <label>Zip Code</label>
                <input type="text" value="${student.zip_code || ''}" id="zipcode" maxlength="4" placeholder="1234" style="padding: 0.4rem; font-size: 0.85rem;">
            </div>

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">👨‍👩‍👧 Guardian Information</h4>

            <div class="form-group" style="margin-bottom: 0.75rem;">
                <label><span style="color: #ef4444; font-weight: 700;">*</span> Guardian Name</label>
                <input type="text" value="${student.guardian_name || ''}" id="guardianName" style="padding: 0.4rem; font-size: 0.85rem;" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Relationship</label>
                    <select id="guardianRelationship" style="padding: 0.4rem; font-size: 0.85rem;" required>
                        <option value="">Select</option>
                        <option value="Parent" ${student.guardian_relationship === 'Parent' ? 'selected' : ''}>Parent</option>
                        <option value="Mother" ${student.guardian_relationship === 'Mother' ? 'selected' : ''}>Mother</option>
                        <option value="Father" ${student.guardian_relationship === 'Father' ? 'selected' : ''}>Father</option>
                        <option value="Guardian" ${student.guardian_relationship === 'Guardian' ? 'selected' : ''}>Guardian</option>
                        <option value="Relative" ${student.guardian_relationship === 'Relative' ? 'selected' : ''}>Relative</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><span style="color: #ef4444; font-weight: 700;">*</span> Phone</label>
                    <input type="tel" value="${student.guardian_phone || ''}" id="guardianPhone" style="padding: 0.4rem; font-size: 0.85rem;" required>
                </div>
            </div>

            <div class="form-group">
                <label>Guardian Email</label>
                <input type="email" value="${student.guardian_email || ''}" id="guardianEmail" style="padding: 0.4rem; font-size: 0.85rem;">
            </div>

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #8B1425; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700;">🏆 Academic Honors</h4>

            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; padding: 0.5rem; background: #f9fafb; border-radius: 0.5rem;">
                <input type="checkbox" id="valedictorian" ${isValedictorian} style="width: 18px; height: 18px; cursor: pointer; accent-color: #8B1425;">
                <label for="valedictorian" style="flex: 1; cursor: pointer; margin: 0; font-weight: 500; font-size: 0.85rem;">👑 Valedictorian</label>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: #f9fafb; border-radius: 0.5rem;">
                <input type="checkbox" id="salutatorian" ${isSalutatorian} style="width: 18px; height: 18px; cursor: pointer; accent-color: #8B1425;">
                <label for="salutatorian" style="flex: 1; cursor: pointer; margin: 0; font-weight: 500; font-size: 0.85rem;">🥈 Salutatorian</label>
            </div>
        </form>
    `;

    // Style form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.style.marginBottom = '0';
        const label = group.querySelector('label');
        if (label) {
            label.style.display = 'block';
            label.style.marginBottom = '0.2rem';
            label.style.fontWeight = '600';
            label.style.color = '#374151';
            label.style.fontSize = '0.8rem';
        }
        const input = group.querySelector('input, select');
        if (input) {
            input.style.width = '100%';
            input.style.border = '1px solid #d1d5db';
            input.style.borderRadius = '0.3rem';
            input.onfocus = function() {
                if (!this.disabled) {
                    this.style.borderColor = '#8B1425';
                    this.style.boxShadow = '0 0 0 2px rgba(139, 20, 37, 0.1)';
                }
            };
            input.onblur = function() {
                this.style.borderColor = '#d1d5db';
                this.style.boxShadow = 'none';
            };
        }
    });

    document.getElementById('saveBtn').style.display = 'block';
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}


async function saveStudent(event) {
    event.preventDefault();

    // Get all values from form
    const first_name = document.getElementById('firstName').value.trim();
    const middle_name = document.getElementById('middleName').value.trim();
    const last_name = document.getElementById('lastName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const date_of_birth = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value.trim();
    const phone_number = document.getElementById('phone').value.trim();
    const street = document.getElementById('street').value.trim();
    const barangay = document.getElementById('barangay').value.trim();
    const city = document.getElementById('city').value.trim();
    const province = document.getElementById('province').value.trim();
    const zip_code = document.getElementById('zipcode').value.trim();
    const guardian_name = document.getElementById('guardianName').value.trim();
    const guardian_relationship = document.getElementById('guardianRelationship').value;
    const guardian_phone = document.getElementById('guardianPhone').value.trim();
    const guardian_email = document.getElementById('guardianEmail').value.trim();
    const age = document.getElementById('age').value.trim();
    const nationality = document.getElementById('nationality').value.trim();
    const citizenship = document.getElementById('citizenship').value.trim();
    const religion = document.getElementById('religion').value.trim();
    const lrn = document.getElementById('lrn').value.trim();
    const previous_school = document.getElementById('previousSchool').value.trim();
    const ext_name = document.getElementById('extName').value.trim();

    // VALIDATE REQUIRED FIELDS
    if (!first_name) {
        alert('❌ First Name is required!');
        document.getElementById('firstName').focus();
        return;
    }
    if (!last_name) {
        alert('❌ Last Name is required!');
        document.getElementById('lastName').focus();
        return;
    }
    if (!date_of_birth) {
        alert('❌ Date of Birth is required!');
        document.getElementById('dob').focus();
        return;
    }
    if (!gender) {
        alert('❌ Gender is required!');
        document.getElementById('gender').focus();
        return;
    }
    if (!street) {
        alert('❌ Street is required!');
        document.getElementById('street').focus();
        return;
    }
    if (!barangay) {
        alert('❌ Barangay is required!');
        document.getElementById('barangay').focus();
        return;
    }
    if (!city) {
        alert('❌ City is required!');
        document.getElementById('city').focus();
        return;
    }
    if (!province) {
        alert('❌ Province is required!');
        document.getElementById('province').focus();
        return;
    }
    if (!guardian_name) {
        alert('❌ Guardian Name is required!');
        document.getElementById('guardianName').focus();
        return;
    }
    if (!guardian_relationship) {
        alert('❌ Guardian Relationship is required!');
        document.getElementById('guardianRelationship').focus();
        return;
    }
    if (!guardian_phone) {
        alert('❌ Guardian Phone is required!');
        document.getElementById('guardianPhone').focus();
        return;
    }

    // Build update data - safely get optional elements
    const strandElement = document.getElementById('strand');
    const valedicatorianElement = document.getElementById('valedictorian');
    const salutatorianElement = document.getElementById('salutatorian');

    const updateData = {
        first_name,
        middle_name: middle_name || null,
        last_name,
        suffix: suffix || null,
        date_of_birth,
        gender,
        email: email || null,
        phone_number: phone_number || null,
        street,
        barangay,
        city,
        province,
        zip_code: zip_code || null,
        guardian_name,
        guardian_relationship,
        guardian_phone,
        guardian_email: guardian_email || null,
        school_level: document.getElementById('schoolLevel').value,
        current_grade_level: document.getElementById('gradeLevel').value,
        student_type: document.getElementById('studentType').value,
        enrollment_status: document.getElementById('status').value,
        strand: strandElement ? strandElement.value || null : null,
        is_valedictorian: valedicatorianElement ? valedicatorianElement.checked : false,
        is_salutatorian: salutatorianElement ? salutatorianElement.checked : false,
        age: age ? parseInt(age) : null,
        nationality: nationality || null,
        citizenship: citizenship || null,
        religion: religion || null,
        lrn: lrn || null,
        previous_school: previous_school || null,
        ext_name: ext_name || null
    };

    console.log('Saving student data:', updateData);

    try {
        const response = await fetch(`http://localhost:3000/api/students/${currentStudent.student_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Student updated successfully!');
            closeModal();
            loadStudents();
        } else {
            console.error('Server error:', data);
            alert('❌ Failed to update: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Connection error: ' + error.message);
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/students/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentStudent = data.student;
            showEditModal(data.student);
        } else {
            alert('Failed to load student data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}


function closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('detailsModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    loadStatistics();
    loadStudents();
});
