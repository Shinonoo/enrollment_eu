const db = require('../config/database');

// Get current school year
const getCurrentSchoolYear = async () => {
    try {
        const [settings] = await db.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'current_school_year'"
        );
        return settings.length > 0 ? settings[0].setting_value : '2025-2026';
    } catch (error) {
        return '2025-2026';
    }
};

// Get next school year (e.g., 2025-2026 → 2026-2027)
const getNextSchoolYear = (currentYear) => {
    const [start, end] = currentYear.split('-');
    return `${parseInt(start) + 1}-${parseInt(end) + 1}`;
};

// Detect returning students for next year
const detectReturningStudents = async (req, res) => {
    try {
        const currentYear = await getCurrentSchoolYear();
        const nextYear = getNextSchoolYear(currentYear);

        // Get all enrolled students in current year
        const [currentStudents] = await db.query(`
            SELECT s.student_id, s.current_grade_level, s.school_level
            FROM students s
            WHERE s.school_year = ? AND s.enrollment_status = 'enrolled'
        `, [currentYear]);

        // Check which ones are not yet in next year
        const [nextYearStudents] = await db.query(`
            SELECT student_id FROM students 
            WHERE school_year = ?
        `, [nextYear]);

        const nextYearIds = nextYearStudents.map(s => s.student_id);
        const returningStudents = currentStudents.filter(s => !nextYearIds.includes(s.student_id));

        // Mark as returning students
        let markedCount = 0;
        for (let student of returningStudents) {
            await db.query(
                `UPDATE students SET is_returning_student = 1, previous_student_number = student_number 
                 WHERE student_id = ?`,
                [student.student_id]
            );
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

// Promote students to next grade
const promoteStudents = async (req, res) => {
    try {
        const { studentIds, nextSchoolYear } = req.body;
        const nextYear = nextSchoolYear || getNextSchoolYear(await getCurrentSchoolYear());

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
                // Get current student details
                const [students] = await db.query(
                    'SELECT * FROM students WHERE student_id = ?',
                    [studentId]
                );

                if (students.length === 0) continue;

                const student = students[0];
                let nextGrade = parseInt(student.current_grade_level) + 1;

                // Validate grade progression
                if (student.school_level === 'JHS' && nextGrade > 10) {
                    // Promote to SHS
                    nextGrade = 11;
                    await db.query(
                        `INSERT INTO students (student_number, first_name, middle_name, last_name, suffix,
                            date_of_birth, gender, email, phone_number, address_line1, address_line2,
                            city, province, zip_code, guardian_name, guardian_relationship, guardian_phone,
                            guardian_email, school_level, current_grade_level, strand, student_type,
                            enrollment_status, school_year, is_returning_student, previous_student_number)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            `${nextYear}-${String(studentId).padStart(6, '0')}`,
                            student.first_name, student.middle_name, student.last_name, student.suffix,
                            student.date_of_birth, student.gender, student.email, student.phone_number,
                            student.address_line1, student.address_line2, student.city, student.province,
                            student.zip_code, student.guardian_name, student.guardian_relationship,
                            student.guardian_phone, student.guardian_email, 'SHS', nextGrade,
                            student.strand, 'regular', 'enrolled', nextYear, 1, student.student_number
                        ]
                    );
                } else if (student.school_level === 'SHS' && nextGrade > 12) {
                    // Mark as graduated
                    await db.query(
                        `UPDATE students SET enrollment_status = 'graduated' WHERE student_id = ?`,
                        [studentId]
                    );
                    errors.push(`Student ${student.first_name} has graduated`);
                    continue;
                } else {
                    // Same school level, just next grade
                    await db.query(
                        `INSERT INTO students (student_number, first_name, middle_name, last_name, suffix,
                            date_of_birth, gender, email, phone_number, address_line1, address_line2,
                            city, province, zip_code, guardian_name, guardian_relationship, guardian_phone,
                            guardian_email, school_level, current_grade_level, strand, student_type,
                            enrollment_status, school_year, is_returning_student, previous_student_number)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            `${nextYear}-${String(studentId).padStart(6, '0')}`,
                            student.first_name, student.middle_name, student.last_name, student.suffix,
                            student.date_of_birth, student.gender, student.email, student.phone_number,
                            student.address_line1, student.address_line2, student.city, student.province,
                            student.zip_code, student.guardian_name, student.guardian_relationship,
                            student.guardian_phone, student.guardian_email, student.school_level, nextGrade,
                            student.strand, 'regular', 'enrolled', nextYear, 1, student.student_number
                        ]
                    );
                }

                // Archive previous history
                await db.query(
                    `INSERT INTO student_history (student_id, school_year, grade_level, enrollment_status, promoted)
                     VALUES (?, ?, ?, ?, 1)`,
                    [studentId, await getCurrentSchoolYear(), student.current_grade_level, 'promoted']
                );

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

// Execute year-end succession
const executeYearEndSuccession = async (req, res) => {
    try {
        const { nextSchoolYear } = req.body;
        const currentYear = await getCurrentSchoolYear();
        const nextYear = nextSchoolYear || getNextSchoolYear(currentYear);

        // Step 1: Archive current year data
        const [currentStudents] = await db.query(`
            SELECT s.student_id, s.current_grade_level, s.school_level, s.enrollment_status
            FROM students s
            WHERE s.school_year = ?
        `, [currentYear]);

        // Step 2: Create promotion records for eligible students
        let promotedCount = 0;
        let graduatedCount = 0;
        let errors = [];

        for (let student of currentStudents) {
            try {
                if (student.enrollment_status !== 'enrolled') continue;

                let nextGrade = parseInt(student.current_grade_level) + 1;

                if (student.school_level === 'JHS' && nextGrade > 10) {
                    // JHS Grade 10 → SHS Grade 11
                    const [existing] = await db.query(
                        `SELECT student_id FROM students 
                         WHERE previous_student_number = (
                            SELECT student_number FROM students WHERE student_id = ?
                         ) AND school_year = ?`,
                        [student.student_id, nextYear]
                    );

                    if (existing.length === 0) {
                        const [baseStudent] = await db.query(
                            'SELECT * FROM students WHERE student_id = ?',
                            [student.student_id]
                        );

                        await db.query(
                            `INSERT INTO students (student_number, first_name, middle_name, last_name, suffix,
                                date_of_birth, gender, email, phone_number, address_line1, address_line2,
                                city, province, zip_code, guardian_name, guardian_relationship, guardian_phone,
                                guardian_email, school_level, current_grade_level, strand, student_type,
                                enrollment_status, school_year, is_returning_student, previous_student_number)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                `${nextYear}-${String(student.student_id).padStart(6, '0')}`,
                                baseStudent[0].first_name, baseStudent[0].middle_name, baseStudent[0].last_name, baseStudent[0].suffix,
                                baseStudent[0].date_of_birth, baseStudent[0].gender, baseStudent[0].email, baseStudent[0].phone_number,
                                baseStudent[0].address_line1, baseStudent[0].address_line2, baseStudent[0].city, baseStudent[0].province,
                                baseStudent[0].zip_code, baseStudent[0].guardian_name, baseStudent[0].guardian_relationship,
                                baseStudent[0].guardian_phone, baseStudent[0].guardian_email, 'SHS', 11,
                                baseStudent[0].strand, 'regular', 'enrolled', nextYear, 1, baseStudent[0].student_number
                            ]
                        );
                        promotedCount++;
                    }
                } else if (student.school_level === 'SHS' && nextGrade > 12) {
                    // SHS Grade 12 → Graduated
                    await db.query(
                        `UPDATE students SET enrollment_status = 'graduated' WHERE student_id = ?`,
                        [student.student_id]
                    );
                    graduatedCount++;
                } else if (student.school_level === 'JHS' || student.school_level === 'SHS') {
                    // Same level, next grade
                    const [baseStudent] = await db.query(
                        'SELECT * FROM students WHERE student_id = ?',
                        [student.student_id]
                    );

                    await db.query(
                        `INSERT INTO students (student_number, first_name, middle_name, last_name, suffix,
                            date_of_birth, gender, email, phone_number, address_line1, address_line2,
                            city, province, zip_code, guardian_name, guardian_relationship, guardian_phone,
                            guardian_email, school_level, current_grade_level, strand, student_type,
                            enrollment_status, school_year, is_returning_student, previous_student_number)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            `${nextYear}-${String(student.student_id).padStart(6, '0')}`,
                            baseStudent[0].first_name, baseStudent[0].middle_name, baseStudent[0].last_name, baseStudent[0].suffix,
                            baseStudent[0].date_of_birth, baseStudent[0].gender, baseStudent[0].email, baseStudent[0].phone_number,
                            baseStudent[0].address_line1, baseStudent[0].address_line2, baseStudent[0].city, baseStudent[0].province,
                            baseStudent[0].zip_code, baseStudent[0].guardian_name, baseStudent[0].guardian_relationship,
                            baseStudent[0].guardian_phone, baseStudent[0].guardian_email, student.school_level, nextGrade,
                            baseStudent[0].strand, 'regular', 'enrolled', nextYear, 1, baseStudent[0].student_number
                        ]
                    );
                    promotedCount++;
                }
            } catch (error) {
                errors.push(`Error processing student ${student.student_id}: ${error.message}`);
            }
        }

        // Step 3: Update system settings
        await db.query(
            `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'current_school_year'`,
            [nextYear]
        );

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

// Get section progression map
const getSectionProgressionMap = async (req, res) => {
    try {
        const currentYear = await getCurrentSchoolYear();
        const nextYear = getNextSchoolYear(currentYear);

        // Get all sections mapping
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
        `, [currentYear]);

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
