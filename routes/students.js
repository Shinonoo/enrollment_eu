const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

// Get statistics
router.get('/statistics',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    studentController.getStudentStatistics
);

// Get all students
router.get('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant', 'cashier'),
    studentController.getAllStudents
);

// Get student by ID
router.get('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant', 'cashier'),
    studentController.getStudentById
);

// Get student by student number
router.get('/number/:studentNumber',
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant', 'cashier'),
    studentController.getStudentByNumber
);

// Update student
router.put('/:id',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    studentController.updateStudent
);

module.exports = router;
