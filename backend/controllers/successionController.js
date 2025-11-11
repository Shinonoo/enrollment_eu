// controllers/successionController.js - ONLY logic & responses
const SuccessionModel = require('../models/successionModel');

const detectReturningStudents = async (req, res) => {
    try {
        const currentYear = await SuccessionModel.getCurrentSchoolYear();
        const nextYear = SuccessionModel.getNextSchoolYear(currentYear);

        const currentStudents = await SuccessionModel.getCurrentYearEnrolledStudents(currentYear);
        const nextYearStudents = await SuccessionModel.getNextYearStudents(nextYear);

        const nextYearIds = nextYearStudents.map(s => s.student_id);
        const returningStudents = currentStudents.filter(s => !nextYearIds.includes(s.student_id));

        let markedCount = 0;
        for (let student of returningStudents) {
            await SuccessionModel.markReturningStudent(student.student_id);
            markedCount++;
        }

        res.json({
            success: true,
            message: `Detected ${markedCount} returning students`,
            returningCount: markedCount,
            students: returningStudents
        });

    } catch (error) {
        console.error('Detect returning students error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to detect returning students'
        });
    }
};

const promoteStudents = async (req, res) => {
    try {
        const { studentIds, nextSchoolYear } = req.body;
        const currentYear = await SuccessionModel.getCurrentSchoolYear();
        const nextYear = nextSchoolYear || SuccessionModel.getNextSchoolYear(currentYear);

        if (!studentIds || studentIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student IDs are required'
            });
        }

        let promotedCount = 0;
        const errors = [];

        for (let studentId of studentIds) {
            try {
                const student = await SuccessionModel.getStudentById(studentId);
                if (!student) continue;

                let nextGrade = parseInt(student.current_grade_level) + 1;

                if (student.school_level === 'JHS' && nextGrade > 10) {
                    // Promote to SHS Grade 11
                    await SuccessionModel.insertPromotedStudent({
                        studentNumber: `${nextYear}-${String(studentId).padStart(6, '0')}`,
                        first_name: student.first_name,
                        middle_name: student.middle_name,
                        last_name: student.last_name,
                        suffix: student.suffix,
                        date_of_birth: student.date_of_birth,
                        gender: student.gender,
                        email: student.email,
                        phone_number: student.phone_number,
                        address_line1: student.address_line1,
                        address_line2: student.address_line2,
                        city: student.city,
                        province: student.province,
                        zip_code: student.zip_code,
                        guardian_name: student.guardian_name,
                        guardian_relationship: student.guardian_relationship,
                        guardian_phone: student.guardian_phone,
                        guardian_email: student.guardian_email,
                        school_level: 'SHS',
                        current_grade_level: 11,
                        strand: student.strand,
                        school_year: nextYear,
                        previous_student_number: student.student_number
                    });
                } else if (student.school_level === 'SHS' && nextGrade > 12) {
                    // Mark as graduated
                    await SuccessionModel.markStudentGraduated(studentId);
                    errors.push(`Student ${student.first_name} has graduated`);
                    continue;
                } else {
                    // Same school level, next grade
                    await SuccessionModel.insertPromotedStudent({
                        studentNumber: `${nextYear}-${String(studentId).padStart(6, '0')}`,
                        first_name: student.first_name,
                        middle_name: student.middle_name,
                        last_name: student.last_name,
                        suffix: student.suffix,
                        date_of_birth: student.date_of_birth,
                        gender: student.gender,
                        email: student.email,
                        phone_number: student.phone_number,
                        address_line1: student.address_line1,
                        address_line2: student.address_line2,
                        city: student.city,
                        province: student.province,
                        zip_code: student.zip_code,
                        guardian_name: student.guardian_name,
                        guardian_relationship: student.guardian_relationship,
                        guardian_phone: student.guardian_phone,
                        guardian_email: student.guardian_email,
                        school_level: student.school_level,
                        current_grade_level: nextGrade,
                        strand: student.strand,
                        school_year: nextYear,
                        previous_student_number: student.student_number
                    });
                }

                await SuccessionModel.insertStudentHistory(studentId, currentYear, student.current_grade_level, 'promoted');
                promotedCount++;
            } catch (error) {
                errors.push(`Failed to promote student ${studentId}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Successfully promoted ${promotedCount} students`,
            promotedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Promote students error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to promote students'
        });
    }
};

const executeYearEndSuccession = async (req, res) => {
    try {
        const { nextSchoolYear } = req.body;
        const currentYear = await SuccessionModel.getCurrentSchoolYear();
        const nextYear = nextSchoolYear || SuccessionModel.getNextSchoolYear(currentYear);

        const currentStudents = await SuccessionModel.getCurrentYearEnrolledStudents(currentYear);

        let promotedCount = 0;
        let graduatedCount = 0;
        const errors = [];

        for (let student of currentStudents) {
            try {
                let nextGrade = parseInt(student.current_grade_level) + 1;

                if (student.school_level === 'JHS' && nextGrade > 10) {
                    // JHS Grade 10 → SHS Grade 11
                    const exists = await SuccessionModel.checkExistingPromotion(student.student_id, nextYear);

                    if (!exists) {
                        const baseStudent = await SuccessionModel.getStudentById(student.student_id);
                        await SuccessionModel.insertPromotedStudent({
                            studentNumber: `${nextYear}-${String(student.student_id).padStart(6, '0')}`,
                            first_name: baseStudent.first_name,
                            middle_name: baseStudent.middle_name,
                            last_name: baseStudent.last_name,
                            suffix: baseStudent.suffix,
                            date_of_birth: baseStudent.date_of_birth,
                            gender: baseStudent.gender,
                            email: baseStudent.email,
                            phone_number: baseStudent.phone_number,
                            address_line1: baseStudent.address_line1,
                            address_line2: baseStudent.address_line2,
                            city: baseStudent.city,
                            province: baseStudent.province,
                            zip_code: baseStudent.zip_code,
                            guardian_name: baseStudent.guardian_name,
                            guardian_relationship: baseStudent.guardian_relationship,
                            guardian_phone: baseStudent.guardian_phone,
                            guardian_email: baseStudent.guardian_email,
                            school_level: 'SHS',
                            current_grade_level: 11,
                            strand: baseStudent.strand,
                            school_year: nextYear,
                            previous_student_number: baseStudent.student_number
                        });
                        promotedCount++;
                    }
                } else if (student.school_level === 'SHS' && nextGrade > 12) {
                    // SHS Grade 12 → Graduated
                    await SuccessionModel.markStudentGraduated(student.student_id);
                    graduatedCount++;
                } else if (student.school_level === 'JHS' || student.school_level === 'SHS') {
                    // Same level, next grade
                    const baseStudent = await SuccessionModel.getStudentById(student.student_id);
                    await SuccessionModel.insertPromotedStudent({
                        studentNumber: `${nextYear}-${String(student.student_id).padStart(6, '0')}`,
                        first_name: baseStudent.first_name,
                        middle_name: baseStudent.middle_name,
                        last_name: baseStudent.last_name,
                        suffix: baseStudent.suffix,
                        date_of_birth: baseStudent.date_of_birth,
                        gender: baseStudent.gender,
                        email: baseStudent.email,
                        phone_number: baseStudent.phone_number,
                        address_line1: baseStudent.address_line1,
                        address_line2: baseStudent.address_line2,
                        city: baseStudent.city,
                        province: baseStudent.province,
                        zip_code: baseStudent.zip_code,
                        guardian_name: baseStudent.guardian_name,
                        guardian_relationship: baseStudent.guardian_relationship,
                        guardian_phone: baseStudent.guardian_phone,
                        guardian_email: baseStudent.guardian_email,
                        school_level: student.school_level,
                        current_grade_level: nextGrade,
                        strand: baseStudent.strand,
                        school_year: nextYear,
                        previous_student_number: baseStudent.student_number
                    });
                    promotedCount++;
                }
            } catch (error) {
                errors.push(`Error processing student ${student.student_id}: ${error.message}`);
            }
        }

        await SuccessionModel.updateCurrentSchoolYear(nextYear);

        res.json({
            success: true,
            message: 'Year-end succession completed successfully',
            summary: {
                promotedCount,
                graduatedCount,
                currentYear,
                nextYear,
                errors: errors.length > 0 ? errors : []
            }
        });

    } catch (error) {
        console.error('Execute succession error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to execute year-end succession'
        });
    }
};

const getSectionProgressionMap = async (req, res) => {
    try {
        const currentYear = await SuccessionModel.getCurrentSchoolYear();
        const nextYear = SuccessionModel.getNextSchoolYear(currentYear);

        const mapping = await SuccessionModel.getSectionProgressionMap(currentYear);

        res.json({
            success: true,
            currentYear,
            nextYear,
            progressionMap: mapping
        });

    } catch (error) {
        console.error('Get progression map error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch progression map'
        });
    }
};

module.exports = {
    detectReturningStudents,
    promoteStudents,
    executeYearEndSuccession,
    getSectionProgressionMap
};
