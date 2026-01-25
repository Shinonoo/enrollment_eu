const db = require('../../config/database');

// ============================================
// PAYMENT STATISTICS
// ============================================
exports.getPaymentStatistics = async (req, res) => {
    try {
        // TODO: Implement your statistics logic
        res.json({
            success: true,
            message: 'Statistics endpoint - Coming soon',
            stats: {
                totalPayments: 0,
                pendingPayments: 0,
                completedPayments: 0
            }
        });
    } catch (error) {
        console.error('❌ Get payment statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment statistics',
            error: error.message
        });
    }
};

// ============================================
// APPLICATIONS FOR PAYMENT
// ============================================
exports.getApplicationsForPayment = async (req, res) => {
    try {
        // TODO: Implement your logic
        res.json({
            success: true,
            applications: []
        });
    } catch (error) {
        console.error('❌ Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};

// ============================================
// PAYMENT SCHEMES (Already implemented)
// ============================================
exports.getPaymentSchemes = async (req, res) => {
    try {
        const [schemes] = await db.query(`
            SELECT 
                scheme_id,
                scheme_name,
                school_level,
                grade_level,
                school_year_id,
                total_amount,
                upon_enrollment,
                installment_count,
                installment_amount,
                cash_discount,
                description,
                is_active,
                created_at,
                updated_at
            FROM payment_schemes
            WHERE is_active = 1
            ORDER BY school_level, grade_level, scheme_name
        `);

        console.log(`✓ Retrieved ${schemes.length} payment schemes`);

        res.json({
            success: true,
            schemes: schemes,
            count: schemes.length
        });
    } catch (error) {
        console.error('❌ Get payment schemes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment schemes',
            error: error.message
        });
    }
};

exports.createPaymentScheme = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            schemeName,
            schoolLevel,
            gradeLevel,
            schoolYearId,
            totalAmount,
            uponEnrollment,
            installmentCount,
            installmentAmount,
            cashDiscount,
            description
        } = req.body;

        if (!schemeName || !schoolLevel || !gradeLevel || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: schemeName, schoolLevel, gradeLevel, totalAmount'
            });
        }

        const [result] = await connection.query(`
            INSERT INTO payment_schemes 
            (scheme_name, school_level, grade_level, school_year_id, 
             total_amount, upon_enrollment, installment_count, 
             installment_amount, cash_discount, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            schemeName, 
            schoolLevel, 
            gradeLevel, 
            schoolYearId || null,
            totalAmount, 
            uponEnrollment || 0, 
            installmentCount || 1, 
            installmentAmount || 0, 
            cashDiscount || 0, 
            description || null
        ]);

        await connection.query(`
            INSERT INTO activity_logs 
            (user_id, action_type, table_name, record_id, description, new_value)
            VALUES (?, 'create', 'payment_schemes', ?, ?, ?)
        `, [
            req.user.userId,
            result.insertId,
            `Created payment scheme: ${schemeName}`,
            JSON.stringify({ schemeName, schoolLevel, gradeLevel, totalAmount })
        ]);

        await connection.commit();

        console.log(`✓ Payment scheme created: ${schemeName} (ID: ${result.insertId})`);

        res.status(201).json({
            success: true,
            message: 'Payment scheme created successfully',
            schemeId: result.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Create payment scheme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment scheme',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

exports.updatePaymentScheme = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            schemeName,
            schoolLevel,
            gradeLevel,
            schoolYearId,
            totalAmount,
            uponEnrollment,
            installmentCount,
            installmentAmount,
            cashDiscount,
            description
        } = req.body;

        if (!schemeName || !schoolLevel || !gradeLevel || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const [oldScheme] = await connection.query(
            'SELECT * FROM payment_schemes WHERE scheme_id = ?',
            [id]
        );

        if (oldScheme.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment scheme not found'
            });
        }

        await connection.query(`
            UPDATE payment_schemes 
            SET scheme_name = ?,
                school_level = ?,
                grade_level = ?,
                school_year_id = ?,
                total_amount = ?,
                upon_enrollment = ?,
                installment_count = ?,
                installment_amount = ?,
                cash_discount = ?,
                description = ?
            WHERE scheme_id = ?
        `, [
            schemeName,
            schoolLevel,
            gradeLevel,
            schoolYearId || null,
            totalAmount,
            uponEnrollment || 0,
            installmentCount || 1,
            installmentAmount || 0,
            cashDiscount || 0,
            description || null,
            id
        ]);

        await connection.query(`
            INSERT INTO activity_logs 
            (user_id, action_type, table_name, record_id, description, old_value, new_value)
            VALUES (?, 'update', 'payment_schemes', ?, ?, ?, ?)
        `, [
            req.user.userId,
            id,
            `Updated payment scheme: ${schemeName}`,
            JSON.stringify(oldScheme[0]),
            JSON.stringify({ schemeName, schoolLevel, gradeLevel, totalAmount })
        ]);

        await connection.commit();

        console.log(`✓ Payment scheme updated: ${schemeName} (ID: ${id})`);

        res.json({
            success: true,
            message: 'Payment scheme updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Update payment scheme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment scheme',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

exports.deletePaymentScheme = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [scheme] = await connection.query(
            'SELECT * FROM payment_schemes WHERE scheme_id = ?',
            [id]
        );

        if (scheme.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment scheme not found'
            });
        }

        await connection.query(
            'UPDATE payment_schemes SET is_active = 0 WHERE scheme_id = ?',
            [id]
        );

        await connection.query(`
            INSERT INTO activity_logs 
            (user_id, action_type, table_name, record_id, description, old_value)
            VALUES (?, 'delete', 'payment_schemes', ?, ?, ?)
        `, [
            req.user.userId,
            id,
            `Deleted payment scheme: ${scheme[0].scheme_name}`,
            JSON.stringify(scheme[0])
        ]);

        await connection.commit();

        console.log(`✓ Payment scheme deleted: ${scheme[0].scheme_name} (ID: ${id})`);

        res.json({
            success: true,
            message: 'Payment scheme deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Delete payment scheme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payment scheme',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// ============================================
// PAYMENT RECORDS
// ============================================
exports.createPaymentRecord = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            message: 'Create payment record - Coming soon'
        });
    } catch (error) {
        console.error('❌ Create payment record error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment record',
            error: error.message
        });
    }
};

// ============================================
// CASHIER ROUTES
// ============================================
exports.getPendingPayments = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            payments: []
        });
    } catch (error) {
        console.error('❌ Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending payments',
            error: error.message
        });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            message: 'Record payment - Coming soon'
        });
    } catch (error) {
        console.error('❌ Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record payment',
            error: error.message
        });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            history: []
        });
    } catch (error) {
        console.error('❌ Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
            error: error.message
        });
    }
};

exports.sendToAccounting = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            message: 'Send to accounting - Coming soon'
        });
    } catch (error) {
        console.error('❌ Send to accounting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send to accounting',
            error: error.message
        });
    }
};

exports.getProcessingStudents = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            students: []
        });
    } catch (error) {
        console.error('❌ Get processing students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch processing students',
            error: error.message
        });
    }
};

exports.enrollStudent = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            message: 'Enroll student - Coming soon'
        });
    } catch (error) {
        console.error('❌ Enroll student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enroll student',
            error: error.message
        });
    }
};

exports.getStudentDetails = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            student: {}
        });
    } catch (error) {
        console.error('❌ Get student details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student details',
            error: error.message
        });
    }
};

exports.getSchemeDetails = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            scheme: {}
        });
    } catch (error) {
        console.error('❌ Get scheme details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scheme details',
            error: error.message
        });
    }
};

exports.voidTransaction = async (req, res) => {
    try {
        // TODO: Implement
        res.json({
            success: true,
            message: 'Void transaction - Coming soon'
        });
    } catch (error) {
        console.error('❌ Void transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to void transaction',
            error: error.message
        });
    }
};
