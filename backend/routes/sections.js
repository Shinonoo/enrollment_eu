const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes (comment out if not using auth yet)
// router.use(authenticateToken);

// Section CRUD - Order matters! More specific routes first
router.get('/progression-map', sectionController.getProgressionMap);
router.get('/grade/:gradeLevel', sectionController.getSectionsByGrade);
router.get('/', sectionController.getAllSections);
router.get('/:sectionId', sectionController.getSectionDetails);
router.post('/', sectionController.createSection);
router.put('/:sectionId', sectionController.updateSection);
router.patch('/:sectionId', sectionController.patchSection);
router.delete('/:sectionId', sectionController.deleteSection);

// Curriculum management - MUST be before /:sectionId routes
router.get('/:sectionId/curriculum', sectionController.getSectionCurriculum);
router.get('/:sectionId/curricula/available', sectionController.getAvailableCurricula);
router.put('/:sectionId/curriculum', sectionController.assignCurriculum);
router.get('/:sectionId/curriculum/subjects', sectionController.getSectionCurriculumSubjects);

// Student management - These need to be before /:sectionId to avoid conflicts
router.get('/students/search', sectionController.searchAvailableStudents);
router.get('/:sectionId/students', sectionController.getSectionStudents); // ✅ ADD THIS
router.post('/:sectionId/students', sectionController.addStudentToSection);
router.delete('/:sectionId/students/:studentId', sectionController.removeStudentFromSection);

// Subject management
router.get('/:sectionId/subjects/available', sectionController.getAvailableSubjects); // ✅ First
router.get('/:sectionId/subjects', sectionController.getSectionSubjects);              // ✅ Second
router.post('/:sectionId/subjects', sectionController.addSubjectToSection);
router.delete('/:sectionId/subjects/:subjectId', sectionController.removeSubjectFromSection);

// Faculty management
router.get('/faculty/available', sectionController.getAvailableFaculty);
router.put('/:sectionId/adviser', sectionController.assignFacultyToSection);

// Section promotion
router.post('/:sectionId/promote', sectionController.promoteSection);

// Get students in a section
router.get('/sections/:sectionId/students', 
    authenticateToken, 
    sectionController.getSectionStudents
);

// Add student to section
router.post('/sections/:sectionId/students', 
    authenticateToken, 
    sectionController.addStudentToSection
);

// Remove student from section
router.delete('/sections/:sectionId/students/:studentId', 
    authenticateToken, 
    sectionController.removeStudentFromSection
);

// Get subjects for a section
router.get('/sections/:sectionId/subjects', 
    authenticateToken, 
    sectionController.getSectionSubjects
);

// Add subject to section
router.post('/sections/:sectionId/subjects', 
    authenticateToken, 
    sectionController.addSubjectToSection
);

// Remove subject from section
router.delete('/sections/:sectionId/subjects/:subjectId', 
    authenticateToken, 
    sectionController.removeSubjectFromSection
);

// Get available subjects for a section (from curriculum)
router.get('/:sectionId/subjects/available', sectionController.getAvailableSubjects);

module.exports = router;
