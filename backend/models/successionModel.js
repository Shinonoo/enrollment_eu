// models/successionModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getCurrentSchoolYear = async () => {
    try {
        const [settings] = await db.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'current_school_year'"
        );
        return settings.length > 0 ? settings[0].setting_value : '2025-2026';
    } catch (error) {
        return '2025-2026';
    }
};

exports.getNextSchoolYear = (currentYear) => {
    const [start, end] = currentYear.split('-');
    return `${parseInt(start) + 1}-${parseInt(end) + 1}`;
};

exports.getCurrentYearEnrolledStudents = async (schoolYear) => {
    const [currentStudents] = await db.query(`
        SELECT s.student_id, s.current_grade_level, s.school_level
        FROM students s
        WHERE s.school_year = ? AND s.enrollment_status = 'enrolled'
    `, [schoolYear]);
    return currentStudents;
};

exports.getNextYearStudents = async (schoolYear) => {
    const [nextYearStudents] = await db.query(`
        SELECT student_id FROM students 
        WHERE school_year = ?
    `, [schoolYear]);
    return nextYearStudents;
};

exports.markReturningStudent = async (studentId) => {
    await db.query(
        `UPDATE students SET is_returning_student = 1, previous_student_number = student_number 
         WHERE student_id = ?`,
        [studentId]
    );
};

exports.getStudentById = async (studentId) => {
    const [students] = await db.query(
        'SELECT * FROM students WHERE student_id = ?',
        [studentId]
    );
    return students[0] || null;
};

exports.insertPromotedStudent = async (data) => {
    await db.query(
        `INSERT INTO students (student_number, first_name, middle_name, last_name, suffix,
            date_of_birth, gender, email, phone_number, address_line1, address_line2,
            city, province, zip_code, guardian_name, guardian_relationship, guardian_phone,
            guardian_email, school_level, current_grade_level, strand, student_type,
            enrollment_status, school_year, is_returning_student, previous_student_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.studentNumber, data.first_name, data.middle_name, data.last_name, data.suffix,
            data.date_of_birth, data.gender, data.email, data.phone_number,
            data.address_line1, data.address_line2, data.city, data.province,
            data.zip_code, data.guardian_name, data.guardian_relationship,
            data.guardian_phone, data.guardian_email, data.school_level, data.current_grade_level,
            data.strand, 'regular', 'enrolled', data.school_year, 1, data.previous_student_number
        ]
    );
};

exports.markStudentGraduated = async (studentId) => {
    await db.query(
        `UPDATE students SET enrollment_status = 'graduated' WHERE student_id = ?`,
        [studentId]
    );
};

exports.insertStudentHistory = async (studentId, schoolYear, gradeLevel, enrollmentStatus) => {
    await db.query(
        `INSERT INTO student_history (student_id, school_year, grade_level, enrollment_status, promoted)
         VALUES (?, ?, ?, ?, 1)`,
        [studentId, schoolYear, gradeLevel, enrollmentStatus]
    );
};

exports.checkExistingPromotion = async (studentId, nextYear) => {
    const [existing] = await db.query(
        `SELECT student_id FROM students 
         WHERE previous_student_number = (
            SELECT student_number FROM students WHERE student_id = ?
         ) AND school_year = ?`,
        [studentId, nextYear]
    );
    return existing.length > 0;
};

exports.updateCurrentSchoolYear = async (nextYear) => {
    await db.query(
        `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'current_school_year'`,
        [nextYear]
    );
};

exports.getSectionProgressionMap = async (schoolYear) => {
    const [mapping] = await db.query(`
        SELECT 
            s1.section_id as current_section_id,
            s1.section_name as current_section,
            s1.grade_level as current_grade,
            s2.section_id as next_section_id,
            s2.section_name as next_section,
            s2.grade_level as next_grade,
            COUNT(DISTINCT ss.student_id) as student_count
        FROM sections s1
        LEFT JOIN sections s2 ON 
            (s1.grade_level < 10 AND s2.grade_level = s1.grade_level + 1 AND s2.school_level = s1.school_level) OR
            (s1.grade_level = 10 AND s2.grade_level = 11 AND s2.school_level = 'SHS') OR
            (s1.grade_level >= 11 AND s2.grade_level = s1.grade_level + 1 AND s2.school_level = 'SHS')
        LEFT JOIN student_sections ss ON s1.section_id = ss.section_id
        WHERE s1.school_year = ? AND s1.is_active = 1
        GROUP BY s1.section_id
        ORDER BY s1.school_level, s1.grade_level
    `, [schoolYear]);
    return mapping;
};
