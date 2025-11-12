const db = require('../config/database');

// Preview promotion: list students with current and next section mapping
exports.previewPromotion = async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT 
                s.student_id, 
                s.student_name, 
                s.current_grade_level, 
                s.section_id, 
                sec.section_name,
                nextSec.section_id AS next_section_id, 
                nextSec.section_name AS next_section_name
            FROM students s
            LEFT JOIN sections sec ON s.section_id = sec.section_id
            LEFT JOIN sections nextSec ON sec.next_section_id = nextSec.section_id
            WHERE s.promotion_eligible = 1 AND s.promotion_status = 'pending' AND s.enrollment_status = 'enrolled'
        `);

        const studentPreviews = students.map(student => ({
            id: student.student_id,
            name: student.student_name,
            currentGrade: student.current_grade_level,
            currentSection: student.section_name || "None",
            nextSection: student.next_section_name || null,
        }));

        return res.json({ success: true, students: studentPreviews });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Promote eligible students with section mapping validation
exports.promoteStudents = async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT * FROM students 
            WHERE promotion_eligible = 1 AND promotion_status = 'pending' AND enrollment_status = 'enrolled'
        `);

        const failedMappings = [];
        const promotedStudents = [];

        for (const student of students) {
            const [section] = await db.query(
                "SELECT next_section_id FROM sections WHERE section_id = ?",
                [student.section_id]
            );

            if (!section.length || !section[0].next_section_id) {
                failedMappings.push({
                    studentId: student.student_id,
                    message: 'Missing next_section_id mapping for current section',
                });
                continue;
            }

            const nextSectionId = section[0].next_section_id;
            let newGrade = student.current_grade_level + 1;
            let newStatus = 'promoted';

            if (student.current_grade_level === 12) {
                await db.query(
                    "INSERT INTO graduated_students (student_id /* add other fields */) VALUES (?)", 
                    [student.student_id /* add other values */]
                );
                newStatus = 'graduated';
                newGrade = null;
            }

            await db.query(`
                INSERT INTO studenthistory 
                (student_id, school_year, grade_level, section_id, enrollment_status, promotion_status) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                student.student_id,
                student.school_year,
                student.current_grade_level,
                student.section_id,
                student.enrollment_status,
                newStatus
            ]);

            await db.query(`
                UPDATE students SET 
                    current_grade_level = ?, 
                    section_id = ?, 
                    promotion_status = ?, 
                    is_returning_student = 1, 
                    enrollment_status = 'completed' 
                WHERE student_id = ?
            `, [newGrade, nextSectionId, newStatus, student.student_id]);

            promotedStudents.push(student.student_id);
        }

        let message = `Promotion run completed. Promoted students: ${promotedStudents.length}.`;
        if (failedMappings.length) {
            message += ` ${failedMappings.length} students skipped due to missing section mapping.`;
        }
        return res.json({ success: true, message, failedMappings, promotedCount: promotedStudents.length });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
