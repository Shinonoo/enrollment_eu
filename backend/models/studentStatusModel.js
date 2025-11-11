// models/studentStatusModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getCompleters = async (schoolYear, search) => {
    let query = `
        SELECT c.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level
        FROM completers c
        JOIN students s ON c.student_id = s.student_id
        WHERE s.school_year = ?
    `;
    const params = [schoolYear];

    if (search) {
        query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY c.completion_date DESC`;
    const [completers] = await db.query(query, params);
    return completers;
};

exports.insertCompleter = async (studentId, completionYear, willContinueSHS) => {
    const [result] = await db.query(
        `INSERT INTO completers (student_id, completion_year, completion_date, will_continue_shs)
         VALUES (?, ?, CURDATE(), ?)`,
        [studentId, completionYear, willContinueSHS ? 1 : 0]
    );
    return result;
};

exports.updateStudentStatus = async (studentId, status) => {
    await db.query(
        `UPDATE students SET enrollment_status = ? WHERE student_id = ?`,
        [status, studentId]
    );
};

exports.getTransferredOut = async (schoolYear, search) => {
    let query = `
        SELECT t.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level,
               u.full_name as processed_by_name
        FROM transferred_out t
        JOIN students s ON t.student_id = s.student_id
        LEFT JOIN users u ON t.processed_by = u.user_id
        WHERE s.school_year = ?
    `;
    const params = [schoolYear];

    if (search) {
        query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY t.transfer_date DESC`;
    const [transferred] = await db.query(query, params);
    return transferred;
};

exports.insertTransferred = async (studentId, transferSchool, transferAddress, reason, userId) => {
    const [result] = await db.query(
        `INSERT INTO transferred_out (student_id, transfer_date, transfer_school, transfer_address, reason, processed_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [studentId, transferSchool, transferAddress || null, reason || null, userId]
    );
    return result;
};

exports.getDropped = async (schoolYear, search) => {
    let query = `
        SELECT d.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level,
               u.full_name as processed_by_name
        FROM dropped_students d
        JOIN students s ON d.student_id = s.student_id
        LEFT JOIN users u ON d.processed_by = u.user_id
        WHERE s.school_year = ?
    `;
    const params = [schoolYear];

    if (search) {
        query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY d.drop_date DESC`;
    const [dropped] = await db.query(query, params);
    return dropped;
};

exports.insertDropped = async (studentId, reason, userId) => {
    const [result] = await db.query(
        `INSERT INTO dropped_students (student_id, drop_date, reason, processed_by)
         VALUES (?, CURDATE(), ?, ?)`,
        [studentId, reason || null, userId]
    );
    return result;
};

exports.getGraduated = async (graduationYear, search) => {
    let query = `
        SELECT g.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level
        FROM graduated_students g
        JOIN students s ON g.student_id = s.student_id
        WHERE g.graduation_year = ?
    `;
    const params = [graduationYear];

    if (search) {
        query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY g.graduation_date DESC`;
    const [graduated] = await db.query(query, params);
    return graduated;
};

exports.insertGraduated = async (studentId, graduationYear, strand, withHonors, honorType) => {
    const [result] = await db.query(
        `INSERT INTO graduated_students (student_id, graduation_date, graduation_year, strand, with_honors, honor_type)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [studentId, graduationYear, strand || null, withHonors ? 1 : 0, honorType || null]
    );
    return result;
};

exports.getStatusStatistics = async (schoolYear) => {
    const [stats] = await db.query(`
        SELECT 
            SUM(CASE WHEN enrollment_status = 'enrolled' THEN 1 ELSE 0 END) as enrolled,
            SUM(CASE WHEN enrollment_status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN enrollment_status = 'transferred_out' THEN 1 ELSE 0 END) as transferred_out,
            SUM(CASE WHEN enrollment_status = 'dropped' THEN 1 ELSE 0 END) as dropped,
            SUM(CASE WHEN enrollment_status = 'graduated' THEN 1 ELSE 0 END) as graduated,
            COUNT(*) as total
        FROM students
        WHERE school_year = ?
    `, [schoolYear]);
    return stats[0];
};
