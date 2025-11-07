const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Public route - no authentication required
router.post('/submit', admissionController.submitApplication);

// Protected routes - require authentication
router.get('/', 
    authenticateToken, 
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.getAllApplications
);

router.get('/statistics',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.getStatistics
);

router.get('/:id', 
    authenticateToken, 
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant'),
    admissionController.getApplicationById
);

router.put('/:id/status',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.updateApplicationStatus
);

router.put('/:id',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.updateApplication
);

router.post('/send-to-accountant',
    authenticateToken,
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    admissionController.sendToAccountant
);


module.exports = router;
