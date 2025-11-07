const db = require('../config/database');

// Get applications ready for payment processing
const getApplicationsForPayment = async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT a.*, 
                   p.payment_record_id, p.total_amount, p.amount_paid, p.payment_status
            FROM admission_applications a
            LEFT JOIN student_payments p ON a.application_id = p.application_id
            WHERE a.status = 'approved' 
            AND a.sent_to_accountant_at IS NOT NULL
            ORDER BY a.sent_to_accountant_at DESC
        `);

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch applications'
        });
    }
};

// Create payment record for student
const createPaymentRecord = async (req, res) => {
    try {
        const { applicationId, schemeId, totalAmount, notes } = req.body;

        if (!applicationId || !totalAmount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Application ID and total amount are required'
            });
        }

        // Check if payment already exists
        const [existing] = await db.query(
            'SELECT payment_record_id FROM student_payments WHERE application_id = ?',
            [applicationId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Payment record already exists for this application'
            });
        }

        // Insert payment record
        const [result] = await db.query(
            `INSERT INTO student_payments (
                application_id, scheme_id, total_amount, amount_paid, 
                payment_status, accountant_notes, created_by_accountant
            ) VALUES (?, ?, ?, 0, 'pending', ?, ?)`,
            [applicationId, schemeId, totalAmount, notes, req.user.userId]
        );

        res.status(201).json({
            success: true,
            message: 'Payment record created successfully',
            paymentRecordId: result.insertId
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create payment record'
        });
    }
};

// Get payment schemes
const getPaymentSchemes = async (req, res) => {
    try {
        const [schemes] = await db.query(`
            SELECT * FROM payment_schemes 
            WHERE is_active = 1 
            ORDER BY school_level, grade_level
        `);

        res.json({
            success: true,
            schemes
        });

    } catch (error) {
        console.error('Get schemes error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch payment schemes'
        });
    }
};

// Create payment scheme
const createPaymentScheme = async (req, res) => {
    try {
        const { 
            schemeName, schoolLevel, gradeLevel, totalAmount, 
            installmentCount
        } = req.body;

        if (!schemeName || !schoolLevel || !totalAmount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Scheme name, school level, and total amount are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO payment_schemes (
                scheme_name, school_level, grade_level, total_amount,
                installment_count
            ) VALUES (?, ?, ?, ?, ?)`,
            [schemeName, schoolLevel, gradeLevel, totalAmount, installmentCount || 1]
        );

        res.status(201).json({
            success: true,
            message: 'Payment scheme created successfully',
            schemeId: result.insertId
        });

    } catch (error) {
        console.error('Create scheme error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create payment scheme'
        });
    }
};


// Get payment statistics
const getPaymentStatistics = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
                SUM(total_amount) as total_amount,
                SUM(amount_paid) as total_collected
            FROM student_payments
        `);

        res.json({
            success: true,
            statistics: stats[0]
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch statistics'
        });
    }
};

// Get pending payments for cashier
const getPendingPayments = async (req, res) => {
    try {
        const [payments] = await db.query(`
            SELECT 
                p.*,
                a.first_name, a.last_name, a.school_level, a.grade_level,
                a.email, a.phone_number,
                s.scheme_name
            FROM student_payments p
            JOIN admission_applications a ON p.application_id = a.application_id
            LEFT JOIN payment_schemes s ON p.scheme_id = s.scheme_id
            WHERE p.payment_status IN ('pending', 'partial')
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch pending payments'
        });
    }
};

// Record payment transaction
const recordPayment = async (req, res) => {
    try {
        const { paymentRecordId, amount, paymentMethod, referenceNumber, notes } = req.body;

        if (!paymentRecordId || !amount || !paymentMethod) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Payment record ID, amount, and payment method are required'
            });
        }

        // Get current payment record
        const [payments] = await db.query(
            'SELECT * FROM student_payments WHERE payment_record_id = ?',
            [paymentRecordId]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Payment record not found'
            });
        }

        const payment = payments[0];
        const newAmountPaid = parseFloat(payment.amount_paid || 0) + parseFloat(amount);
        const totalAmount = parseFloat(payment.total_amount);

        // Determine new status
        let newStatus;
        if (newAmountPaid >= totalAmount) {
            newStatus = 'paid';
        } else if (newAmountPaid > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'pending';
        }

        // Insert transaction record
        await db.query(
            `INSERT INTO payment_transactions (
                payment_record_id, amount, payment_method, 
                reference_number, transaction_date, processed_by_cashier
            ) VALUES (?, ?, ?, ?, NOW(), ?)`,
            [paymentRecordId, amount, paymentMethod, referenceNumber || null, req.user.userId]
        );

        // Update payment record
        await db.query(
            `UPDATE student_payments 
            SET amount_paid = ?, payment_status = ?
            WHERE payment_record_id = ?`,
            [newAmountPaid, newStatus, paymentRecordId]
        );

        // ⭐ FIX: If fully paid, create student AND update admission status to 'enrolled'
        if (newStatus === 'paid') {
            // Create student from application
            await createStudentFromApplication(payment.application_id);
            
            // UPDATE admission status to 'enrolled' so it disappears from admissions list
            await db.query(
                `UPDATE admission_applications 
                 SET status = 'enrolled'
                 WHERE application_id = ?`,
                [payment.application_id]
            );
        }

        res.json({
            success: true,
            message: 'Payment recorded successfully',
            newStatus,
            studentEnrolled: newStatus === 'paid'
        });

    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to record payment'
        });
    }
};




// Helper function to create student record from application
async function createStudentFromApplication(applicationId) {
    try {
        // Get application details
        const [applications] = await db.query(
            'SELECT * FROM admission_applications WHERE application_id = ?',
            [applicationId]
        );

        if (applications.length === 0) return;

        const app = applications[0];

        // Generate student number
        const year = new Date().getFullYear();
        const [lastStudent] = await db.query(
            'SELECT student_number FROM students ORDER BY student_id DESC LIMIT 1'
        );
        
        let studentNumber;
        if (lastStudent.length > 0) {
            const lastNum = parseInt(lastStudent[0].student_number.split('-')[1]);
            studentNumber = `${year}-${String(lastNum + 1).padStart(6, '0')}`;
        } else {
            studentNumber = `${year}-000001`;
        }

        // Insert student record
        await db.query(
            `INSERT INTO students (
                student_number, first_name, middle_name, last_name, suffix,
                date_of_birth, gender, email, phone_number,
                address_line1, address_line2, city, province, zip_code,
                guardian_name, guardian_relationship, guardian_phone, guardian_email,
                school_level, current_grade_level, strand,
                student_type, enrollment_status, school_year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                studentNumber, app.first_name, app.middle_name, app.last_name, app.suffix,
                app.date_of_birth, app.gender, app.email, app.phone_number,
                app.address_line1, app.address_line2, app.city, app.province, app.zip_code,
                app.guardian_name, app.guardian_relationship, app.guardian_phone, app.guardian_email,
                app.school_level, app.grade_level, app.strand,
                'regular', 'enrolled', '2025-2026'
            ]
        );

        console.log(`✅ Student enrolled: ${studentNumber} - ${app.first_name} ${app.last_name}`);

    } catch (error) {
        console.error('Create student error:', error);
        throw error;
    }
}

// Get payment history
const getPaymentHistory = async (req, res) => {
    try {
        const { paymentRecordId } = req.params;

        const [transactions] = await db.query(
            `SELECT t.*, u.full_name as cashier_name
             FROM payment_transactions t
             LEFT JOIN users u ON t.processed_by_cashier = u.user_id
             WHERE t.payment_record_id = ?
             ORDER BY t.transaction_date DESC`,
            [paymentRecordId]
        );

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch payment history'
        });
    }
};


module.exports = {
    getApplicationsForPayment,
    createPaymentRecord,
    getPaymentSchemes,
    createPaymentScheme,
    getPaymentStatistics,
    getPendingPayments,     
    recordPayment,  
    getPaymentHistory 
};
