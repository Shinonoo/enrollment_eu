const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// ============================================
// PUBLIC ROUTES (no auth)
// ============================================
router.post('/submit', admissionController.submitApplication);

// ============================================
// PROTECTED ROUTES - SPECIFIC ROUTES FIRST
// ============================================

// Statistics route MUST come before /:id
router.get('/statistics',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.getStatistics
);

// Send to accountant - specific route before /:id
router.post('/send-to-accountant',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.sendToAccountant
);

// List all applications
router.get('/', 
    authenticateToken, 
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.getAllApplications
);

// ============================================
// PARAMETERIZED ROUTES (/:id) - ALWAYS LAST
// ============================================

// Get single application by ID
router.get('/:id', 
    authenticateToken, 
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant'),
    admissionController.getApplicationById
);

// Update application status
router.put('/:id/status',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.updateApplicationStatus
);

// Update full application
router.put('/:id',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.updateApplication
);

module.exports = router;
