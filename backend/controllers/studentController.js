const db = require('../config/database');

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const { schoolLevel, gradeLevel, enrollmentStatus, studentType, search } = req.query;

        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (schoolLevel) {
            query += ' AND school_level = ?';
            params.push(schoolLevel);
        }

        if (gradeLevel) {
            query += ' AND current_grade_level = ?';
            params.push(gradeLevel);
        }

        if (enrollmentStatus) {
            query += ' AND enrollment_status = ?';
            params.push(enrollmentStatus);
        }

        if (studentType) {
            query += ' AND student_type = ?';
            params.push(studentType);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR student_number LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY enrolled_at DESC';

        const [students] = await db.query(query, params);

        res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch students'
        });
    }
};

// Get single student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await db.query(
            'SELECT * FROM students WHERE student_id = ?',
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student: students[0]
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch student'
        });
    }
};

// Get student by student number
const getStudentByNumber = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const [students] = await db.query(
            'SELECT * FROM students WHERE student_number = ?',
            [studentNumber]
        );

        if (students.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student: students[0]
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch student'
        });
    }
};

// Update student information
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name,
            middle_name,
            last_name,
            suffix,
            date_of_birth,
            gender,
            email,
            phone_number,
            street,
            barangay,
            city,
            province,
            zip_code,
            guardian_name,
            guardian_relationship,
            guardian_phone,
            guardian_email,
            school_level,
            current_grade_level,
            strand,
            student_type,
            enrollment_status,
            is_valedictorian,
            is_salutatorian
        } = req.body;

        // Validation for required fields
        if (!first_name || !last_name || !date_of_birth || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: first_name, last_name, date_of_birth, gender'
            });
        }

        if (!street || !barangay || !city || !province) {
            return res.status(400).json({
                success: false,
                message: 'Missing required address fields: street, barangay, city, province'
            });
        }

        if (!guardian_name || !guardian_relationship || !guardian_phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required guardian fields'
            });
        }

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
                updated_at = CURRENT_TIMESTAMP
             WHERE student_id = ?`,
            [
                first_name,
                middle_name || null,
                last_name,
                suffix || null,
                date_of_birth,
                gender,
                email || null,
                phone_number || null,
                street,
                barangay,
                city,
                province,
                zip_code || null,
                guardian_name,
                guardian_relationship,
                guardian_phone,
                guardian_email || null,
                school_level,
                current_grade_level,
                strand || null,
                student_type,
                enrollment_status,
                is_valedictorian ? 1 : 0,
                is_salutatorian ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to update student: ' + error.message
        });
    }
};

// Get student statistics
const getStudentStatistics = async (req, res) => {
    try {
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

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentByNumber,
    updateStudent,
    getStudentStatistics
};
