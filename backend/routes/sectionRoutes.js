const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Section CRUD
router.get('/', sectionController.getAllSections);
router.get('/:sectionId', sectionController.getSectionDetails);
router.post('/', sectionController.createSection);
router.put('/:sectionId', sectionController.updateSection);

// Student management
router.get('/students/search', sectionController.searchAvailableStudents);
router.post('/:sectionId/students', sectionController.addStudentToSection);
router.delete('/:sectionId/students/:studentId', sectionController.removeStudentFromSection);

// Subject management
router.post('/:sectionId/subjects', sectionController.addSubjectToSection);
router.delete('/:sectionId/subjects/:subjectId', sectionController.removeSubjectFromSection);

// Faculty management
router.get('/faculty/available', sectionController.getAvailableFaculty);
router.put('/:sectionId/adviser', sectionController.assignFacultyToSection);

module.exports = router;
