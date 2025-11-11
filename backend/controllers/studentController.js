// controllers/studentController.js - ONLY logic & responses
const StudentModel = require('../models/studentModel');

const getAllStudents = async (req, res) => {
    try {
        const { schoolLevel, gradeLevel, enrollmentStatus, studentType, search, honorRoll } = req.query;

        const students = await StudentModel.getAllStudents({
            schoolLevel,
            gradeLevel,
            enrollmentStatus,
            studentType,
            search,
            honorRoll: honorRoll === 'true',  // parse boolean
        });

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

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await StudentModel.getStudentById(id);

        if (!student) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch student'
        });
    }
};

const getStudentByNumber = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const student = await StudentModel.getStudentByNumber(studentNumber);

        if (!student) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch student'
        });
    }
};

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
            is_salutatorian,
            // ✅ ADD THESE MISSING FIELDS
            age,
            nationality,
            citizenship,
            religion,
            lrn,
            previous_school,
            ext_name
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

        const result = await StudentModel.updateStudent(id, {
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
            is_salutatorian,
            // ✅ PASS THESE TO MODEL
            age,
            nationality,
            citizenship,
            religion,
            lrn,
            previous_school,
            ext_name
        });

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

const getStudentStatistics = async (req, res) => {
    try {
        const statistics = await StudentModel.getStudentStatistics();

        res.json({
            success: true,
            statistics
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
