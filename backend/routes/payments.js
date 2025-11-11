const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication FIRST
router.use(authenticateToken);

// Debug middleware AFTER authentication - MOVE THIS HERE
router.use((req, res, next) => {
    console.log(`\n📨 Payment Route Hit: ${req.method} ${req.path}`);
    console.log(`   User: ${req.user ? req.user.userId : 'Authentication failed'}`);
    console.log(`   Role: ${req.user ? req.user.role : 'N/A'}`);
    next();
});

// Statistics
router.get('/statistics',
    checkRole('admin', 'accountant', 'cashier'),
    paymentController.getPaymentStatistics
);

// Applications ready for payment
router.get('/applications',
    checkRole('admin', 'accountant'),
    paymentController.getApplicationsForPayment
);

// Payment schemes
router.get('/schemes',
    checkRole('admin', 'accountant', 'cashier'),
    paymentController.getPaymentSchemes
);

router.post('/schemes',
    checkRole('admin', 'accountant'),
    paymentController.createPaymentScheme
);

// ADD THESE TWO ROUTES
router.put('/schemes/:id',
    checkRole('admin', 'accountant'),
    paymentController.updatePaymentScheme
);

router.delete('/schemes/:id',
    checkRole('admin', 'accountant'),
    paymentController.deletePaymentScheme
);

// Payment records
router.post('/create',
    checkRole('admin', 'accountant'),
    paymentController.createPaymentRecord
);

// Cashier routes
router.get('/pending',
    checkRole('admin', 'cashier'),
    paymentController.getPendingPayments
);

router.post('/record',
    checkRole('admin', 'cashier'),
    paymentController.recordPayment
);

router.get('/history/:paymentRecordId',
    checkRole('admin', 'cashier', 'accountant'),
    paymentController.getPaymentHistory
);

// Send to accounting
router.post('/send-to-accounting',
    checkRole('admin', 'cashier'),
    paymentController.sendToAccounting
);

// Get students in processing status (sent back from cashier)
router.get('/processing',
    checkRole('admin', 'accountant'),
    paymentController.getProcessingStudents
);

// Enroll student after printing registration form
router.post('/enroll',
    checkRole('admin', 'accountant'),
    paymentController.enrollStudent
);

// Get detailed student info for registration form
router.get('/student-details/:paymentRecordId',
    checkRole('admin', 'accountant'),
    paymentController.getStudentDetails
);

router.get('/scheme-details/:paymentRecordId',
    checkRole('admin', 'cashier'),
    paymentController.getSchemeDetails
);

router.delete('/void/:transactionId',
    checkRole('admin', 'cashier'),
    paymentController.voidTransaction
);


module.exports = router;
