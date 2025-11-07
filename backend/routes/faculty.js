const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

// Get statistics (MUST be before /:id)
router.get('/statistics',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.getFacultyStatistics
);

// Get all faculty
router.get('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.getAllFaculty
);

// Create faculty
router.post('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.createFaculty
);

// Get faculty by ID (MUST come after /statistics and before PUT/DELETE)
router.get('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.getFacultyById
);

// Update faculty
router.put('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.updateFaculty
);

// Delete faculty
router.delete('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    facultyController.deleteFaculty
);

module.exports = router;
