const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sectionsController');
const successionController = require('../controllers/successionController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

// ⭐ IMPORTANT: Specific routes BEFORE generic /:id routes

// Get statistics (SPECIFIC - MUST BE FIRST)
router.get('/statistics',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.getSectionStatistics
);

// Get all sections
router.get('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.getAllSections
);

// Create section
router.post('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.createSection
);

// Year-End Succession Routes (SPECIFIC)
router.post('/succession/detect-returning',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    successionController.detectReturningStudents
);

router.post('/succession/promote',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    successionController.promoteStudents
);

router.post('/succession/execute',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    successionController.executeYearEndSuccession
);

router.get('/succession/progression-map',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    successionController.getSectionProgressionMap
);

// Get unassigned students (SPECIFIC)
router.get('/:id/unassigned-students',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.getUnassignedStudents
);

// ⭐ SUBJECT ROUTES (NEW)
router.get('/:id/subjects',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.getSectionSubjects
);

router.post('/:id/subjects',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.addSubjectToSection
);

router.delete('/:id/subjects',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.removeSubjectFromSection
);

// Assign student to section
router.post('/:id/assign',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.assignStudentToSection
);

// Remove student from section
router.delete('/:id/students/:studentId',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.removeStudentFromSection
);

// ⭐ GENERIC ROUTES AFTER SPECIFIC ONES

// Get section details
router.get('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.getSectionDetails
);

// Update section
router.put('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.updateSection
);

// Delete section
router.delete('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.deleteSection
);

// Promote all students in section
router.post('/:id/promote',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    sectionsController.promoteSection
);


module.exports = router;
