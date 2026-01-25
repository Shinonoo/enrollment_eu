// models/paymentModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getApplicationsForPayment = async () => {
    const [applications] = await db.query(`
        SELECT 
            a.admission_id as application_id,
            a.application_number,
            a.school_level,
            a.current_status as status,
            a.submitted_at as sent_to_accountant_at,
            p.first_name,
            p.middle_name,
            p.last_name,
            p.suffix,
            g.grade_name as grade_level,
            s.strand_name as strand,
            a.total_assessed as total_amount,
            a.total_paid as amount_paid,
            CASE 
                WHEN a.total_paid = 0 THEN 'pending'
                WHEN a.total_paid >= a.total_assessed THEN 'paid'
                ELSE 'partial'
            END as payment_status
        FROM admissions a
        JOIN applicants_personal_info p ON a.admission_id = p.admission_id
        JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
        LEFT JOIN strands s ON a.strand_id = s.strand_id
        WHERE a.current_status IN ('sent_to_accounting', 'payment_assessed', 'ready_for_payment')
        ORDER BY a.submitted_at DESC
    `);
    return applications;
};

exports.checkPaymentExists = async (applicationId) => {
    const [existing] = await db.query(
        'SELECT assessment_id FROM payment_assessments WHERE admission_id = ?',
        [applicationId]
    );
    return existing.length > 0;
};

exports.getPaymentSchemes = async () => {
    const [schemes] = await db.query(`
        SELECT 
            scheme_id,
            scheme_code,
            scheme_name,
            description,
            discount_percentage,
            number_of_installments,
            is_active
        FROM payment_schemes 
        WHERE is_active = 1 
        ORDER BY scheme_name
    `);
    return schemes;
};

exports.createPaymentScheme = async (data) => {
    const [result] = await db.query(
        `INSERT INTO payment_schemes (
            scheme_code, scheme_name, description,
            discount_percentage, number_of_installments, is_active
        ) VALUES (?, ?, ?, ?, ?, 1)`,
        [
            data.schemeCode || data.schemeName.toLowerCase().replace(/\s+/g, '_'),
            data.schemeName, 
            data.description || null,
            data.discountPercentage || 0,
            data.numberOfInstallments || 1
        ]
    );
    return result;
};

exports.getPaymentStatistics = async () => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN current_status IN ('submitted', 'pending_verification', 'documents_verified') THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN current_status = 'partial_payment' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN current_status IN ('payment_completed', 'approved', 'enrolled') THEN 1 ELSE 0 END) as paid,
            SUM(total_assessed) as total_amount,
            SUM(total_paid) as total_collected
        FROM admissions
        WHERE current_status != 'rejected'
    `);
    return stats[0];
};

exports.getPendingPayments = async () => {
    const [payments] = await db.query(`
        SELECT 
            a.admission_id as payment_record_id,
            a.admission_id as application_id,
            a.application_number,
            p.first_name,
            p.last_name,
            a.school_level,
            g.grade_name as grade_level,
            p.email,
            p.phone_number,
            ps.scheme_name,
            a.total_assessed as total_amount,
            a.total_paid as amount_paid,
            a.remaining_balance,
            CASE 
                WHEN a.total_paid = 0 THEN 'pending'
                WHEN a.total_paid >= a.total_assessed THEN 'paid'
                ELSE 'partial'
            END as payment_status,
            a.submitted_at as created_at
        FROM admissions a
        JOIN applicants_personal_info p ON a.admission_id = p.admission_id
        JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
        LEFT JOIN payment_assessments pa ON a.admission_id = pa.admission_id
        LEFT JOIN payment_schemes ps ON pa.approved_payment_scheme = ps.scheme_code
        WHERE a.current_status IN ('ready_for_payment', 'partial_payment', 'payment_completed')
        ORDER BY a.submitted_at DESC
    `);
    return payments;
};

exports.getPaymentById = async (paymentRecordId) => {
    const [result] = await db.query(
        `SELECT 
            a.admission_id as payment_record_id,
            a.admission_id as application_id,
            a.total_paid as amount_paid,
            a.total_assessed as total_amount,
            a.remaining_balance,
            CASE 
                WHEN a.total_paid = 0 THEN 'pending'
                WHEN a.total_paid >= a.total_assessed THEN 'paid'
                ELSE 'partial'
            END as payment_status,
            pa.down_payment_amount as upon_enrollment,
            pa.number_of_installments as installment_count,
            (a.remaining_balance / NULLIF(pa.number_of_installments - 1, 0)) as installment_amount
         FROM admissions a
         LEFT JOIN payment_assessments pa ON a.admission_id = pa.admission_id
         WHERE a.admission_id = ?`,
        [paymentRecordId]
    );
    return result[0] || null;
};

exports.recordPaymentTransaction = async (data) => {
    await db.query(
        `INSERT INTO payments (
            admission_id, amount, payment_method, 
            reference_number, received_by, payment_type
        ) VALUES (?, ?, ?, ?, ?, 'installment')`,
        [data.paymentRecordId, data.amount, data.paymentMethod, data.referenceNumber || null, data.userId]
    );
};

exports.updatePaymentRecord = async (paymentRecordId, amountPaid, status) => {
    const statusMap = {
        'pending': 'ready_for_payment',
        'partial': 'partial_payment',
        'paid': 'payment_completed'
    };

    await db.query(
        `UPDATE admissions 
        SET total_paid = ?, 
            remaining_balance = total_assessed - ?,
            current_status = ?,
            updated_at = NOW()
        WHERE admission_id = ?`,
        [amountPaid, amountPaid, statusMap[status] || status, paymentRecordId]
    );
};

exports.updatePaymentStatus = async (paymentRecordId, status) => {
    const statusMap = {
        'pending': 'ready_for_payment',
        'processing': 'sent_to_accounting',
        'paid': 'payment_completed'
    };

    await db.query(
        `UPDATE admissions 
         SET current_status = ?, 
             updated_at = NOW() 
         WHERE admission_id = ?`,
        [statusMap[status] || status, paymentRecordId]
    );
    return true;
};

exports.getApplicationById = async (applicationId) => {
    const [applications] = await db.query(
        'SELECT * FROM admissions WHERE admission_id = ?',
        [applicationId]
    );
    return applications[0] || null;
};

exports.getLastStudentNumber = async () => {
    const [lastStudent] = await db.query(
        'SELECT student_number FROM students ORDER BY student_id DESC LIMIT 1'
    );
    return lastStudent.length > 0 ? lastStudent[0] : null;
};

exports.updateAdmissionToEnrolled = async (applicationId) => {
    await db.query(
        `UPDATE admissions 
         SET current_status = 'enrolled',
             enrolled_at = NOW()
         WHERE admission_id = ?`,
        [applicationId]
    );
};

exports.getPaymentHistory = async (paymentRecordId) => {
    const [transactions] = await db.query(
        `SELECT 
            p.payment_id as transaction_id,
            p.amount,
            p.payment_method,
            p.reference_number,
            p.payment_date as transaction_date,
            CONCAT(u.first_name, ' ', u.last_name) as cashier_name
         FROM payments p
         LEFT JOIN users u ON p.received_by = u.user_id
         WHERE p.admission_id = ?
         ORDER BY p.payment_date DESC`,
        [paymentRecordId]
    );
    return transactions;
};

exports.getProcessingStudents = async () => {
    const [students] = await db.query(`
        SELECT 
            a.admission_id as payment_record_id,
            a.admission_id as application_id,
            p.first_name,
            p.last_name,
            p.middle_name,
            p.suffix,
            a.school_level,
            g.grade_name as grade_level,
            s.strand_name as strand,
            p.email,
            p.phone_number,
            addr.street_address as street,
            addr.barangay,
            addr.city_municipality as city,
            addr.province,
            addr.zip_code,
            g1.guardian_name,
            g1.guardian_relationship,
            g1.guardian_phone,
            g1.guardian_email,
            p.date_of_birth,
            p.gender,
            ac.previous_school_name as previous_school,
            ps.scheme_name,
            a.total_assessed as total_amount,
            a.total_paid as amount_paid,
            a.updated_at
        FROM admissions a
        JOIN applicants_personal_info p ON a.admission_id = p.admission_id
        JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
        LEFT JOIN strands s ON a.strand_id = s.strand_id
        LEFT JOIN applicants_address addr ON a.admission_id = addr.admission_id
        LEFT JOIN applicants_guardians g1 ON a.admission_id = g1.admission_id AND g1.is_primary = 1
        LEFT JOIN applicants_academic ac ON a.admission_id = ac.admission_id
        LEFT JOIN payment_assessments pa ON a.admission_id = pa.admission_id
        LEFT JOIN payment_schemes ps ON pa.approved_payment_scheme = ps.scheme_code
        WHERE a.current_status = 'sent_to_accounting'
        ORDER BY a.updated_at DESC
    `);
    return students;
};

exports.getStudentDetails = async (paymentRecordId) => {
    const [result] = await db.query(`
        SELECT 
            a.admission_id as payment_record_id,
            a.admission_id as application_id,
            p.first_name,
            p.last_name,
            p.middle_name,
            p.suffix,
            p.date_of_birth,
            p.gender,
            p.email,
            p.phone_number,
            addr.street_address as street,
            addr.barangay,
            addr.city_municipality as city,
            addr.province,
            addr.zip_code,
            g1.guardian_name,
            g1.guardian_relationship,
            g1.guardian_phone,
            g1.guardian_email,
            a.school_level,
            g.grade_name as grade_level,
            s.strand_name as strand,
            ac.previous_school_name as previous_school,
            ps.scheme_name,
            a.total_assessed as total_amount,
            a.total_paid as amount_paid
        FROM admissions a
        JOIN applicants_personal_info p ON a.admission_id = p.admission_id
        JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
        LEFT JOIN strands s ON a.strand_id = s.strand_id
        LEFT JOIN applicants_address addr ON a.admission_id = addr.admission_id
        LEFT JOIN applicants_guardians g1 ON a.admission_id = g1.admission_id AND g1.is_primary = 1
        LEFT JOIN applicants_academic ac ON a.admission_id = ac.admission_id
        LEFT JOIN payment_assessments pa ON a.admission_id = pa.admission_id
        LEFT JOIN payment_schemes ps ON pa.approved_payment_scheme = ps.scheme_code
        WHERE a.admission_id = ?
    `, [paymentRecordId]);

    return result[0] || null;
};

exports.createStudent = async (data) => {
    const [result] = await db.query(
        `INSERT INTO students (
            student_number, admission_id, lrn,
            first_name, middle_name, last_name, suffix,
            date_of_birth, gender, email, phone_number,
            current_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
            data.studentNumber,
            data.applicationId,
            data.lrn || '',
            data.first_name,
            data.middle_name,
            data.last_name,
            data.suffix,
            data.date_of_birth,
            data.gender,
            data.email,
            data.phone_number
        ]
    );
    return result;
};

exports.markSentToCashier = async (applicationId) => {
    await db.query(
        `UPDATE admissions 
         SET current_status = 'ready_for_payment',
             sent_to_accounting_at = NOW() 
         WHERE admission_id = ?`,
        [applicationId]
    );
};

exports.linkPaymentToApplication = async (applicationId, paymentRecordId) => {
    await db.query(
        `UPDATE admissions 
         SET current_status = 'ready_for_payment'
         WHERE admission_id = ?`,
        [applicationId]
    );
};

exports.updatePaymentScheme = async (schemeId, data) => {
    const [result] = await db.query(
        `UPDATE payment_schemes 
         SET scheme_name = ?,
             description = ?,
             discount_percentage = ?,
             number_of_installments = ?,
             updated_at = NOW()
         WHERE scheme_id = ?`,
        [
            data.schemeName,
            data.description || null,
            data.discountPercentage || 0,
            data.numberOfInstallments,
            schemeId
        ]
    );
    return result.affectedRows;
};

exports.deletePaymentScheme = async (schemeId) => {
    const [result] = await db.query(
        'UPDATE payment_schemes SET is_active = 0 WHERE scheme_id = ?',
        [schemeId]
    );
    return result.affectedRows;
};

exports.getSchemeDetailsByPaymentRecord = async (paymentRecordId) => {
    const [result] = await db.query(`
        SELECT 
            a.total_assessed as total_amount,
            pa.down_payment_amount as upon_enrollment,
            pa.number_of_installments as installment_count,
            (a.remaining_balance / NULLIF(pa.number_of_installments - 1, 0)) as installment_amount,
            CASE WHEN pa.approved_payment_scheme = 'custom' THEN 1 ELSE 0 END as is_custom_payment,
            pa.notes as custom_reason,
            ps.scheme_name
        FROM admissions a
        LEFT JOIN payment_assessments pa ON a.admission_id = pa.admission_id
        LEFT JOIN payment_schemes ps ON pa.approved_payment_scheme = ps.scheme_code
        WHERE a.admission_id = ?
    `, [paymentRecordId]);

    return result[0] || null;
};

exports.createPaymentRecord = async (data) => {
    const [result] = await db.query(
        `INSERT INTO payment_assessments (
            admission_id, total_amount, net_amount,
            approved_payment_scheme, down_payment_amount,
            number_of_installments, assessed_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.applicationId,
            data.totalAmount,
            data.totalAmount,
            data.schemeCode || 'custom',
            data.uponEnrollment || 0,
            data.installmentCount || 1,
            data.userId,
            data.notes
        ]
    );

    // Update admission status
    await db.query(
        `UPDATE admissions 
         SET current_status = 'payment_assessed',
             total_assessed = ?,
             assessed_at = NOW()
         WHERE admission_id = ?`,
        [data.totalAmount, data.applicationId]
    );

    return result;
};

exports.getTransactionById = async (transactionId) => {
    const [result] = await db.query(
        'SELECT * FROM payments WHERE payment_id = ?',
        [transactionId]
    );
    return result[0] || null;
};

exports.deleteTransaction = async (transactionId) => {
    // Get transaction details first
    const [transaction] = await db.query(
        'SELECT admission_id, amount FROM payments WHERE payment_id = ?',
        [transactionId]
    );

    if (transaction.length > 0) {
        // Delete transaction
        await db.query(
            'DELETE FROM payments WHERE payment_id = ?',
            [transactionId]
        );

        // Recalculate totals for the admission
        await db.query(`
            UPDATE admissions a
            SET total_paid = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE admission_id = a.admission_id),
                remaining_balance = total_assessed - (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE admission_id = a.admission_id)
            WHERE admission_id = ?
        `, [transaction[0].admission_id]);
    }
};