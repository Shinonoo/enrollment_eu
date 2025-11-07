const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

// Get all reports
router.get('/',
    checkRole('admin', 'registrar_shs', 'registrar_jhs', 'accountant'),
    reportsController.getAllReports
);

// Generate daily report
router.post('/daily',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    reportsController.generateDailyReport
);

// Generate monthly report
router.post('/monthly',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    reportsController.generateMonthlyReport
);

// Generate yearly report
router.post('/yearly',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    reportsController.generateYearlyReport
);

// Get chart statistics
router.get('/chart/statistics',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    reportsController.getStudentStatisticsChart
);

// Get trending data
router.get('/chart/trending',
    checkRole('admin', 'registrar_shs', 'registrar_jhs'),
    reportsController.getTrendingData
);

module.exports = router;
