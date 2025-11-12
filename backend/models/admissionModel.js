// models/admissionModel.js - CORRECTED (without guardian_address)

const db = require('../config/dbLogger');

exports.createAdmission = async (data) => {
    const [result] = await db.query(
        `INSERT INTO admission_applications (
        lrn, first_name, middle_name, last_name, suffix,
        date_of_birth, gender, email, phone_number,
        city, province, zip_code, street, barangay,
        guardian_name, guardian_relationship, guardian_phone, guardian_email,
        school_level, grade_level, previous_school, strand,
        status, application_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.lrn || null,
            data.firstName,
            data.middleName || null,
            data.lastName,
            data.suffix || null,
            data.dateOfBirth,
            data.gender,
            data.email || null,
            data.phoneNumber || null,
            data.street,
            data.barangay || null,
            data.city,
            data.province,
            data.zipCode || null,
            data.guardianName,
            data.guardianRelationship,
            data.guardianPhone,
            data.guardianEmail || null,
            data.schoolLevel,
            data.gradeLevel,
            data.previousSchool || null,
            data.strand || null,
            data.applicationType,
            'pending'
        ]
    );
    return result;
};

exports.getAllAdmissions = async (filters) => {
    let query = `SELECT * FROM admission_applications WHERE status NOT IN ('enrolled', 'completed', 'dropped')`;
    const params = [];

    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }
    if (filters.schoolLevel) {
        query += ' AND school_level = ?';
        params.push(filters.schoolLevel);
    }
    if (filters.gradeLevel) {
        query += ' AND grade_level = ?';
        params.push(filters.gradeLevel);
    }
    if (filters.applicationType) {
        query += ' AND application_type = ?';
        params.push(filters.applicationType);
    }

    query += ' ORDER BY submitted_at DESC';
    const [applications] = await db.query(query, params);
    return applications;
};

exports.getAdmissionById = async (id) => {
    const [applications] = await db.query(
        'SELECT * FROM admission_applications WHERE application_id = ?',
        [id]
    );
    return applications[0] || null;
};

exports.updateAdmissionStatus = async (id, status, registrarNotes, rejectionReason, userId) => {
    await db.query(
        `UPDATE admission_applications 
         SET status = ?, registrar_notes = ?, rejection_reason = ?, 
             reviewed_by_registrar = ?, reviewed_at = NOW()
         WHERE application_id = ?`,
        [status, registrarNotes, rejectionReason, userId, id]
    );

    if (status === 'approved') {
        await db.query(
            `UPDATE admission_applications 
             SET sent_to_accountant_at = NOW()
             WHERE application_id = ?`,
            [id]
        );
    }
};

exports.getStatistics = async () => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs,
            SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs
        FROM admission_applications
        WHERE status NOT IN ('enrolled', 'completed', 'dropped')
    `);
    return stats[0];
};

exports.sendToAccountant = async (applicationIds) => {
    await db.query(
        `UPDATE admission_applications 
         SET sent_to_accountant_at = NOW()
         WHERE application_id IN (?) AND status = 'approved'`,
        [applicationIds]
    );
};

exports.updateApplication = async (id, data) => {
    await db.query(
        `UPDATE admission_applications SET
            lrn = ?, first_name = ?, middle_name = ?, last_name = ?, suffix = ?,
            date_of_birth = ?, gender = ?,
            email = ?, phone_number = ?,
            street = ?, barangay = ?, city = ?, province = ?, zip_code = ?,
            guardian_name = ?, guardian_relationship = ?, guardian_phone = ?, guardian_email = ?,
            school_level = ?, grade_level = ?, previous_school = ?, strand = ?,
            application_type = ?
         WHERE application_id = ?`,
        [
            data.lrn || null, data.firstName, data.middleName || null, data.lastName, data.suffix || null,
            data.dateOfBirth, data.gender,
            data.email || null, data.phoneNumber || null,
            data.street, data.barangay || null, data.city, data.province, data.zipCode || null,
            data.guardianName, data.guardianRelationship, data.guardianPhone, data.guardianEmail || null,
            data.schoolLevel, data.gradeLevel, data.previousSchool || null, data.strand || null,
            data.applicationType, id
        ]
    );
};

exports.addGuardians = async (applicationId, guardiansList) => {
  if (!guardiansList || guardiansList.length === 0) return;
  const values = guardiansList.map(g => [applicationId, g.name, g.relationship, g.phone, g.email || null]);
  await db.query(
    'INSERT INTO guardians (application_id, name, relationship, phone, email) VALUES ?',
    [values]
  );
};

exports.getGuardiansByApplicationId = async (applicationId) => {
  const [rows] = await db.query('SELECT * FROM guardians WHERE application_id = ?', [applicationId]);
  return rows;
};