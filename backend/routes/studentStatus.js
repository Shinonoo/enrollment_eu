const express = require('express');
const router = express.Router();
const statusController = require('../controllers/studentStatusController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

// Statistics
router.get('/statistics',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.getStatusStatistics
);

// Completers
router.get('/completers',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.getCompleters
);

router.post('/completers',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.markAsCompleter
);

// Transferred Out
router.get('/transferred',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.getTransferredOut
);

router.post('/transferred',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.markAsTransferred
);

// Dropped
router.get('/dropped',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.getDropped
);

router.post('/dropped',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.markAsDropped
);

// Graduated
router.get('/graduated',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.getGraduated
);

router.post('/graduated',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    statusController.markAsGraduated
);

module.exports = router;
