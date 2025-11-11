// models/paymentModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getApplicationsForPayment = async () => {
    const [applications] = await db.query(`
        SELECT a.*, 
               p.payment_record_id, p.total_amount, p.amount_paid, p.payment_status
        FROM admission_applications a
        LEFT JOIN payment_records p ON a.application_id = p.application_id
        WHERE a.status = 'approved' 
        AND a.sent_to_accountant_at IS NOT NULL
        ORDER BY a.sent_to_accountant_at DESC
    `);
    return applications;
};

exports.checkPaymentExists = async (applicationId) => {
    const [existing] = await db.query(
        'SELECT payment_record_id FROM payment_records WHERE application_id = ?',
        [applicationId]
    );
    return existing.length > 0;
};

exports.getPaymentSchemes = async () => {
    const [schemes] = await db.query(`
        SELECT * FROM payment_schemes 
        WHERE is_active = 1 
        ORDER BY school_level, grade_level
    `);
    return schemes;
};

exports.createPaymentScheme = async (data) => {
    const [result] = await db.query(
        `INSERT INTO payment_schemes (
            scheme_name, school_level, grade_level, school_year,
            total_amount, upon_enrollment, installment_count, 
            installment_amount, cash_discount, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.schemeName, 
            data.schoolLevel, 
            data.gradeLevel, 
            data.schoolYear || '2025-2026',
            data.totalAmount, 
            data.uponEnrollment || 0,
            data.installmentCount || 1,
            data.installmentAmount || 0,
            data.cashDiscount || 0,
            data.description || null
        ]
    );
    return result;
};


exports.getPaymentStatistics = async () => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(total_amount) as total_amount,
            SUM(amount_paid) as total_collected
        FROM payment_records
    `);
    return stats[0];
};

exports.getPendingPayments = async () => {
    const [payments] = await db.query(`
        SELECT 
            p.*,
            a.first_name, a.last_name, a.school_level, a.grade_level,
            a.email, a.phone_number,
            s.scheme_name,
            p.upon_enrollment,
            p.installment_count,
            p.installment_amount
        FROM payment_records p
        JOIN admission_applications a ON p.application_id = a.application_id
        LEFT JOIN payment_schemes s ON p.scheme_id = s.scheme_id
        WHERE p.payment_status IN ('pending', 'partial', 'paid')
        ORDER BY p.created_at DESC
    `);
    return payments;
};


// Get payment by ID - SINGLE DEFINITION
exports.getPaymentById = async (paymentRecordId) => {
    const [result] = await db.query(
        `SELECT 
            payment_record_id, 
            application_id, 
            amount_paid, 
            total_amount, 
            payment_status,
            upon_enrollment,
            installment_count,
            installment_amount
         FROM payment_records 
         WHERE payment_record_id = ?`,
        [paymentRecordId]
    );
    return result[0] || null;
};

exports.recordPaymentTransaction = async (data) => {
    await db.query(
        `INSERT INTO payment_transactions (
            payment_record_id, amount, payment_method, 
            reference_number, recorded_by
        ) VALUES (?, ?, ?, ?, ?)`,
        [data.paymentRecordId, data.amount, data.paymentMethod, data.referenceNumber || null, data.userId]
    );
};

exports.updatePaymentRecord = async (paymentRecordId, amountPaid, status) => {
    await db.query(
        `UPDATE payment_records 
        SET amount_paid = ?, payment_status = ?, updated_at = NOW()
        WHERE payment_record_id = ?`,
        [amountPaid, status, paymentRecordId]
    );
};

// Update payment status
exports.updatePaymentStatus = async (paymentRecordId, status) => {
    await db.query(
        `UPDATE payment_records 
         SET payment_status = ?, 
             updated_at = NOW() 
         WHERE payment_record_id = ?`,
        [status, paymentRecordId]
    );
    return true;
};

exports.getApplicationById = async (applicationId) => {
    const [applications] = await db.query(
        'SELECT * FROM admission_applications WHERE application_id = ?',
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
        `UPDATE admission_applications 
         SET status = 'enrolled'
         WHERE application_id = ?`,
        [applicationId]
    );
};

exports.getPaymentHistory = async (paymentRecordId) => {
    const [transactions] = await db.query(
        `SELECT t.*, u.full_name as cashier_name
         FROM payment_transactions t
         LEFT JOIN users u ON t.recorded_by = u.user_id
         WHERE t.payment_record_id = ?
         ORDER BY t.transaction_date DESC`,
        [paymentRecordId]
    );
    return transactions;
};

exports.getProcessingStudents = async () => {
    const [students] = await db.query(`
        SELECT 
            p.*,
            a.first_name, a.last_name, a.middle_name, a.suffix,
            a.school_level, a.grade_level, a.strand,
            a.email, a.phone_number,
            a.street, a.barangay, a.city, a.province, a.zip_code,
            a.guardian_name, a.guardian_relationship, a.guardian_phone, a.guardian_email,
            a.date_of_birth, a.gender, a.previous_school,
            s.scheme_name
        FROM payment_records p
        JOIN admission_applications a ON p.application_id = a.application_id
        LEFT JOIN payment_schemes s ON p.scheme_id = s.scheme_id
        WHERE p.payment_status = 'processing'
        ORDER BY p.updated_at DESC
    `);
    return students;
};

exports.getStudentDetails = async (paymentRecordId) => {
    const [result] = await db.query(`
        SELECT 
            p.*,
            a.first_name, a.last_name, a.middle_name, a.suffix,
            a.date_of_birth, a.gender, a.email, a.phone_number,
            a.street, a.barangay, a.city, a.province, a.zip_code,
            a.guardian_name, a.guardian_relationship, a.guardian_phone, a.guardian_email,
            a.school_level, a.grade_level, a.strand, a.previous_school,
            s.scheme_name
        FROM payment_records p
        JOIN admission_applications a ON p.application_id = a.application_id
        LEFT JOIN payment_schemes s ON p.scheme_id = s.scheme_id
        WHERE p.payment_record_id = ?
    `, [paymentRecordId]);
    
    return result[0] || null;
};

exports.createStudent = async (data) => {
    await db.query(
        `INSERT INTO students (
            student_number, application_id, first_name, middle_name, last_name, suffix,
            date_of_birth, gender, email, phone_number,
            street, barangay, city, province, zip_code,
            guardian_name, guardian_relationship, guardian_phone, guardian_email,
            school_level, current_grade_level, strand,
            student_type, enrollment_status, school_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.studentNumber,
            data.applicationId || null,
            data.first_name,
            data.middle_name,
            data.last_name,
            data.suffix,
            data.date_of_birth,
            data.gender,
            data.email,
            data.phone_number,
            data.street,  // maps to street
            data.barangay,  // maps to barangay
            data.city,
            data.province,
            data.zip_code,      // Changed to zip_code (with underscore)
            data.guardian_name,
            data.guardian_relationship,
            data.guardian_phone,
            data.guardian_email,
            data.school_level,
            data.grade_level,
            data.strand,
            'regular',
            'enrolled',
            '2025-2026'
        ]
    );
};

exports.markSentToCashier = async (applicationId) => {
  await db.query(
    'UPDATE admission_applications SET sent_to_cashier_at = NOW() WHERE application_id = ?',
    [applicationId]
  );
};

// In paymentModel.js
exports.linkPaymentToApplication = async (applicationId, paymentRecordId) => {
  await db.query(
    `UPDATE admission_applications 
     SET payment_record_id = ?, sent_to_cashier_at = NOW() 
     WHERE application_id = ?`,
    [paymentRecordId, applicationId]
  );
};

// Update payment scheme
exports.updatePaymentScheme = async (schemeId, data) => {
    const [result] = await db.query(
        `UPDATE payment_schemes 
         SET scheme_name = ?,
             school_level = ?,
             grade_level = ?,
             total_amount = ?,
             upon_enrollment = ?,
             installment_count = ?,
             installment_amount = ?,
             cash_discount = ?,
             description = ?,
             updated_at = NOW()
         WHERE scheme_id = ?`,
        [
            data.schemeName,
            data.schoolLevel,
            data.gradeLevel,
            data.totalAmount,
            data.uponEnrollment || 0,
            data.installmentCount,
            data.installmentAmount,
            data.cashDiscount || 0,
            data.description || null,
            schemeId
        ]
    );
    return result.affectedRows;
};

// Delete payment scheme
exports.deletePaymentScheme = async (schemeId) => {
    const [result] = await db.query(
        'DELETE FROM payment_schemes WHERE scheme_id = ?',
        [schemeId]
    );
    return result.affectedRows;
};

// Get scheme details by payment record ID
exports.getSchemeDetailsByPaymentRecord = async (paymentRecordId) => {
    const [result] = await db.query(`
        SELECT 
            pr.total_amount,
            pr.upon_enrollment,
            pr.installment_count,
            pr.installment_amount,
            pr.is_custom_payment,
            pr.notes as custom_reason,
            ps.scheme_name
        FROM payment_records pr
        LEFT JOIN payment_schemes ps ON pr.scheme_id = ps.scheme_id
        WHERE pr.payment_record_id = ?
    `, [paymentRecordId]);
    
    return result[0] || null;
};

exports.createPaymentRecord = async (data) => {
    const [result] = await db.query(
        `INSERT INTO payment_records (
            application_id, scheme_id, total_amount, amount_paid, 
            upon_enrollment, installment_count, installment_amount,
            is_custom_payment, payment_status, notes, created_by
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
            data.applicationId, 
            data.schemeId, 
            data.totalAmount, 
            data.uponEnrollment || 0,
            data.installmentCount || 1,
            data.installmentAmount || 0,
            data.isCustomPayment || 0,
            data.notes, 
            data.userId
        ]
    );
    return result;
};

exports.getTransactionById = async (transactionId) => {
    const [result] = await db.query(
        'SELECT * FROM payment_transactions WHERE transaction_id = ?',
        [transactionId]
    );
    return result[0] || null;
};

exports.deleteTransaction = async (transactionId) => {
    await db.query(
        'DELETE FROM payment_transactions WHERE transaction_id = ?',
        [transactionId]
    );
};
