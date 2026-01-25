const express = require('express');
const router = express.Router();
// FIXED: Both are in parallel 'accounting' folders
const paymentController = require('../../controllers/accounting/paymentController');
const { authenticateToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roleCheck');

// Rest of your routes code...

// All routes require authentication FIRST
router.use(authenticateToken);

// Debug middleware AFTER authentication
router.use((req, res, next) => {
    console.log(`\n📨 Payment Route Hit: ${req.method} ${req.path}`);
    console.log(`   User: ${req.user ? req.user.userId : 'Authentication failed'}`);
    console.log(`   Role: ${req.user ? req.user.role : 'N/A'}`);
    next();
});

// Statistics
router.get('/statistics',
    checkRole('admin', 'accounting_clerk', 'cashier'),
    paymentController.getPaymentStatistics
);

// Applications ready for payment
router.get('/applications',
    checkRole('admin', 'accounting_clerk'),
    paymentController.getApplicationsForPayment
);

// Payment schemes
router.get('/schemes',
    checkRole('admin', 'accounting_clerk', 'cashier'),
    paymentController.getPaymentSchemes
);

router.post('/schemes',
    checkRole('admin', 'accounting_clerk'),
    paymentController.createPaymentScheme
);

router.put('/schemes/:id',
    checkRole('admin', 'accounting_clerk'),
    paymentController.updatePaymentScheme
);

router.delete('/schemes/:id',
    checkRole('admin', 'accounting_clerk'),
    paymentController.deletePaymentScheme
);

// Payment records
router.post('/create',
    checkRole('admin', 'accounting_clerk'),
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
    checkRole('admin', 'cashier', 'accounting_clerk'),
    paymentController.getPaymentHistory
);

// Send to accounting
router.post('/send-to-accounting',
    checkRole('admin', 'cashier'),
    paymentController.sendToAccounting
);

// Get students in processing status (sent back from cashier)
router.get('/processing',
    checkRole('admin', 'accounting_clerk'),
    paymentController.getProcessingStudents
);

// Enroll student after printing registration form
router.post('/enroll',
    checkRole('admin', 'accounting_clerk'),
    paymentController.enrollStudent
);

// Get detailed student info for registration form
router.get('/student-details/:paymentRecordId',
    checkRole('admin', 'accounting_clerk'),
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
