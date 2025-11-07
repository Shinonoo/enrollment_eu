const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticateToken);

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


module.exports = router;
