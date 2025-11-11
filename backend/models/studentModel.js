// models/studentModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getAllStudents = async (filters) => {
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (filters.schoolLevel) {
        query += ' AND school_level = ?';
        params.push(filters.schoolLevel);
    }

    if (filters.gradeLevel) {
        query += ' AND current_grade_level = ?';
        params.push(filters.gradeLevel);
    }

    if (filters.enrollmentStatus) {
        query += ' AND enrollment_status = ?';
        params.push(filters.enrollmentStatus);
    }

    if (filters.studentType) {
        query += ' AND student_type = ?';
        params.push(filters.studentType);
    }

    if (filters.search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_number LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY enrolled_at DESC';

    const [students] = await db.query(query, params);
    return students;
};

exports.getStudentById = async (id) => {
    const [students] = await db.query(
        'SELECT * FROM students WHERE student_id = ?',
        [id]
    );
    return students[0] || null;
};

exports.getStudentByNumber = async (studentNumber) => {
    const [students] = await db.query(
        'SELECT * FROM students WHERE student_number = ?',
        [studentNumber]
    );
    return students[0] || null;
};

exports.updateStudent = async (id, data) => {
    const [result] = await db.query(
        `UPDATE students SET
            first_name = ?,
            middle_name = ?,
            last_name = ?,
            suffix = ?,
            date_of_birth = ?,
            gender = ?,
            email = ?,
            phone_number = ?,
            street = ?,
            barangay = ?,
            city = ?,
            province = ?,
            zip_code = ?,
            guardian_name = ?,
            guardian_relationship = ?,
            guardian_phone = ?,
            guardian_email = ?,
            school_level = ?,
            current_grade_level = ?,
            strand = ?,
            student_type = ?,
            enrollment_status = ?,
            is_valedictorian = ?,
            is_salutatorian = ?,
            age = ?,
            nationality = ?,
            citizenship = ?,
            religion = ?,
            lrn = ?,
            previous_school = ?,
            ext_name = ?,
            updated_at = CURRENT_TIMESTAMP
         WHERE student_id = ?`,
        [
            data.first_name,
            data.middle_name || null,
            data.last_name,
            data.suffix || null,
            data.date_of_birth,
            data.gender,
            data.email || null,
            data.phone_number || null,
            data.street,
            data.barangay,
            data.city,
            data.province,
            data.zip_code || null,
            data.guardian_name,
            data.guardian_relationship,
            data.guardian_phone,
            data.guardian_email || null,
            data.school_level,
            data.current_grade_level,
            data.strand || null,
            data.student_type,
            data.enrollment_status,
            data.is_valedictorian ? 1 : 0,
            data.is_salutatorian ? 1 : 0,
            data.age || null,
            data.nationality || null,
            data.citizenship || null,
            data.religion || null,
            data.lrn || null,
            data.previous_school || null,
            data.ext_name || null,
            id
        ]
    );
    return result;
};

exports.getStudentStatistics = async () => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN enrollment_status = 'enrolled' THEN 1 ELSE 0 END) as enrolled,
            SUM(CASE WHEN enrollment_status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN enrollment_status = 'transferred_out' THEN 1 ELSE 0 END) as transferred,
            SUM(CASE WHEN enrollment_status = 'dropped' THEN 1 ELSE 0 END) as dropped,
            SUM(CASE WHEN enrollment_status = 'graduated' THEN 1 ELSE 0 END) as graduated,
            SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs,
            SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs,
            SUM(CASE WHEN student_type = 'regular' THEN 1 ELSE 0 END) as regular,
            SUM(CASE WHEN student_type = 'irregular' THEN 1 ELSE 0 END) as irregular,
            SUM(CASE WHEN student_type = 'transferee' THEN 1 ELSE 0 END) as transferee
        FROM students
    `);
    return stats[0];
};

exports.getAllStudents = async (filters) => {
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (filters.honorRoll) {
        query += ' AND is_honor_roll = 1';
    }

    // other filter conditions here, e.g., schoolLevel, gradeLevel...

    const [students] = await db.query(query, params);
    return students;
};
