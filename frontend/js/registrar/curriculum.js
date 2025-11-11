
let allCurricula = [];
let allSubjects = [];
let currentEditId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', function () {
  loadCurricula();
  loadSubjects();
  setupFilters();
});

// Load curricula from API
async function loadCurricula() {
  try {
    const response = await fetch('/api/curriculum');
    const data = await response.json();
    allCurricula = data.curricula || [];
    renderTable();
  } catch (error) {
    console.error('Error loading curricula:', error);
    document.getElementById('curriculaTable').innerHTML = '<tr><td colspan="8" class="no-data">Error loading data</td></tr>';
  }
}

// Load subjects from API
async function loadSubjects() {
  try {
    const response = await fetch('/api/subjects'); // Adjust endpoint if needed
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
                    <td><span class="subject-count">${curriculum.subject_count}</span></td>
                    <td>
                        <button class="btn-toggle ${curriculum.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                                onclick="toggleStatus(${curriculum.curriculum_id})">
                            ${curriculum.is_active ? 'Active' : 'Inactive'}
                        </button>
                    </td>
                    <td class="actions">
                        <button class="btn-icon btn-view" onclick="viewDetail(${curriculum.curriculum_id})" title="View">👁️</button>
                        <button class="btn-icon btn-edit" onclick="editCurriculum(${curriculum.curriculum_id})" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deleteCurriculum(${curriculum.curriculum_id})" title="Delete">🗑️</button>
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

  document.getElementById('curriculaTable').innerHTML = filtered.length === 0
    ? '<tr><td colspan="8" class="no-data">No curricula found</td></tr>'
    : filtered.map(curriculum => `
                    <tr>
                        <td>${curriculum.curriculum_code}</td>
                        <td>${curriculum.curriculum_name}</td>
                        <td><span class="badge badge-level">${curriculum.school_level}</span></td>
                        <td>${curriculum.grade_level}</td>
                        <td>${curriculum.strand || '-'}</td>
                        <td><span class="subject-count">${curriculum.subject_count}</span></td>
                        <td>
                            <button class="btn-toggle ${curriculum.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}" 
                                    onclick="toggleStatus(${curriculum.curriculum_id})">
                                ${curriculum.is_active ? 'Active' : 'Inactive'}
                            </button>
                        </td>
                        <td class="actions">
                            <button class="btn-icon btn-view" onclick="viewDetail(${curriculum.curriculum_id})" title="View">👁️</button>
                            <button class="btn-icon btn-edit" onclick="editCurriculum(${curriculum.curriculum_id})" title="Edit">✏️</button>
                            <button class="btn-icon btn-delete" onclick="deleteCurriculum(${curriculum.curriculum_id})" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('');
}

// Open create modal
function openCreateModal() {
  currentEditId = null;
  document.getElementById('modalTitle').textContent = 'Create Curriculum';
  document.getElementById('curriculumForm').reset();
  document.getElementById('curriculumModal').classList.add('active');
  renderSubjectsList();
}

// Close modal
function closeModal() {
  document.getElementById('curriculumModal').classList.remove('active');
  currentEditId = null;
}

// Close detail modal
function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

// Render subjects list
function renderSubjectsList() {
  const container = document.getElementById('subjectsContainer');
  const schoolLevel = document.getElementById('schoolLevel').value;
  const gradeLevel = document.getElementById('gradeLevel').value;

  if (!schoolLevel || !gradeLevel) {
    container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">Select school and grade level first</p>';
    return;
  }

  const filtered = allSubjects.filter(s => s.school_level === schoolLevel && s.grade_level === gradeLevel);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No subjects available</p>';
    return;
  }

  container.innerHTML = filtered.map(subject => `
                <div class="subject-item">
                    <input type="checkbox" name="subjects" value="${subject.subject_id}">
                    <span class="subject-label">
                        ${subject.subject_code} - ${subject.subject_name}
                        <small>(${subject.units} units)</small>
                    </span>
                </div>
            `).join('');
}

// Filter subjects by level
function filterSubjectsByLevel() {
  renderSubjectsList();
}

// Edit curriculum
function editCurriculum(id) {
  const curriculum = allCurricula.find(c => c.curriculum_id === id);
  if (!curriculum) return;

  currentEditId = id;
  document.getElementById('modalTitle').textContent = 'Edit Curriculum';
  document.getElementById('curriculumCode').value = curriculum.curriculum_code;
  document.getElementById('curriculumName').value = curriculum.curriculum_name;
  document.getElementById('schoolLevel').value = curriculum.school_level;
  document.getElementById('gradeLevel').value = curriculum.grade_level;
  document.getElementById('strand').value = curriculum.strand || '';
  document.getElementById('description').value = curriculum.description || '';

  renderSubjectsList();
  document.getElementById('curriculumModal').classList.add('active');
}

// View detail
function viewDetail(id) {
  const curriculum = allCurricula.find(c => c.curriculum_id === id);
  if (!curriculum) return;

  document.getElementById('detailTitle').textContent = curriculum.curriculum_name;

  let html = `
                <div class="detail-info">
                    <div class="detail-item">
                        <strong>Code:</strong>
                        <span>${curriculum.curriculum_code}</span>
                    </div>
                    <div class="detail-item">
                        <strong>School Level:</strong>
                        <span>${curriculum.school_level}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Grade Level:</strong>
                        <span>${curriculum.grade_level}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Strand:</strong>
                        <span>${curriculum.strand || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong>
                        <span class="badge ${curriculum.is_active ? 'badge-status-active' : 'badge-status-inactive'}">
                            ${curriculum.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Created:</strong>
                        <span>${new Date(curriculum.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `;

  if (curriculum.description) {
    html += `<div class="description-box"><strong>Description:</strong><p>${curriculum.description}</p></div>`;
  }

  html += `<h3 style="margin-top: 20px; color: #2c3e50;">Subjects (${curriculum.subject_count})</h3>`;

  if (curriculum.subjects && curriculum.subjects.length > 0) {
    html += `
                    <table class="subjects-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject Name</th>
                                <th>Units</th>
                                <th>Semester</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${curriculum.subjects.map(s => `
                                <tr>
                                    <td>${s.subject_code}</td>
                                    <td>${s.subject_name}</td>
                                    <td>${s.units}</td>
                                    <td><span class="badge-semester">${s.semester}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
  } else {
    html += '<p style="color: #7f8c8d; text-align: center; margin-top: 20px;">No subjects assigned</p>';
  }

  document.getElementById('detailContent').innerHTML = html;
  document.getElementById('detailModal').classList.add('active');
}

// Edit current
function editCurrentCurriculum() {
  closeDetailModal();
  editCurriculum(currentEditId);
}

// Handle form submit
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('curriculumForm'));
  const selectedSubjects = Array.from(document.querySelectorAll('input[name="subjects"]:checked')).map(cb => cb.value);

  const data = {
    curriculum_code: formData.get('curriculum_code'),
    curriculum_name: formData.get('curriculum_name'),
    school_level: formData.get('school_level'),
    grade_level: formData.get('grade_level'),
    strand: formData.get('strand'),
    description: formData.get('description'),
    subjects: selectedSubjects
  };

  try {
    const url = currentEditId
      ? `/api/curriculum/${currentEditId}/update`
      : '/api/curriculum/create';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      closeModal();
      loadCurricula();
    } else {
      alert('Error saving curriculum');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving curriculum');
  }
}

// Toggle status
async function toggleStatus(id) {
  try {
    const response = await fetch(`/api/curriculum/${id}/toggle-status`, { method: 'POST' });
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
    const response = await fetch(`/api/curriculum/${id}/delete`, { method: 'POST' });
    if (response.ok) {
      loadCurricula();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
