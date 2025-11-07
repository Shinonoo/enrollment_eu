document.addEventListener('DOMContentLoaded', function() {
  // Search functionality
  const searchInput = document.getElementById('searchCurriculum');
  if (searchInput) {
    searchInput.addEventListener('keyup', filterCurricula);
  }

  // Filter functionality
  const filterSchool = document.getElementById('filterSchoolLevel');
  const filterGrade = document.getElementById('filterGradeLevel');
  if (filterSchool) filterSchool.addEventListener('change', filterCurricula);
  if (filterGrade) filterGrade.addEventListener('change', filterCurricula);
});

function filterCurricula() {
  const searchValue = document.getElementById('searchCurriculum')?.value.toLowerCase() || '';
  const schoolFilter = document.getElementById('filterSchoolLevel')?.value || '';
  const gradeFilter = document.getElementById('filterGradeLevel')?.value || '';
  
  const rows = document.querySelectorAll('.curriculum-row');
  
  rows.forEach(row => {
    const code = row.cells[0]?.textContent.toLowerCase() || '';
    const name = row.cells[1]?.textContent.toLowerCase() || '';
    const school = row.dataset.school || '';
    const grade = row.dataset.grade || '';
    
    const matchesSearch = code.includes(searchValue) || name.includes(searchValue);
    const matchesSchool = !schoolFilter || school === schoolFilter;
    const matchesGrade = !gradeFilter || grade === gradeFilter;
    
    row.style.display = matchesSearch && matchesSchool && matchesGrade ? '' : 'none';
  });
}

// Add subject to curriculum (via AJAX)
async function addSubjectToCurriculum(curriculumId, subjectId) {
  try {
    const response = await fetch(`/curriculum/${curriculumId}/add-subject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject_id: subjectId })
    });
    
    if (response.ok) {
      location.reload();
    }
  } catch (error) {
    console.error('Error adding subject:', error);
  }
}

// Remove subject from curriculum (via AJAX)
async function removeSubjectFromCurriculum(curriculumId, subjectId) {
  if (confirm('Remove this subject from the curriculum?')) {
    try {
      const response = await fetch(`/curriculum/${curriculumId}/remove-subject/${subjectId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        location.reload();
      }
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  }
}
