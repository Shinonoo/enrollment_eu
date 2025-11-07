const db = require('../config/database');

// Get all sections
const getAllSections = async (req, res) => {
    try {
        const { search, gradeLevel } = req.query;

        let query = `SELECT * FROM sections WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND section_name LIKE ?`;
            params.push(`%${search}%`);
        }

        if (gradeLevel) {
            query += ` AND grade_level = ?`;
            params.push(gradeLevel);
        }

        query += ` ORDER BY grade_level, section_name`;

        const [sections] = await db.query(query, params);

        // Get ACTIVE student count for each section (only is_current = 1)
        for (let section of sections) {
            const [count] = await db.query(
                `SELECT COUNT(*) as total FROM student_sections 
                 WHERE section_id = ? AND is_current = 1`,
                [section.section_id]
            );
            section.enrolled_count = count[0]?.total || 0;
        }

        res.json({
            success: true,
            sections: sections
        });

    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};




// Create new section
const createSection = async (req, res) => {
    try {
        const { sectionName, schoolLevel, gradeLevel, schoolYear, adviserId, maxCapacity } = req.body;

        if (!sectionName || !schoolLevel || !gradeLevel || !schoolYear) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Section name, school level, grade level, and school year are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO sections (section_name, school_level, grade_level, school_year, adviser_id, max_capacity, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [sectionName, schoolLevel, gradeLevel, schoolYear, adviserId || null, maxCapacity || 40]
        );

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            sectionId: result.insertId
        });

    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create section'
        });
    }
};

// Update section
const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { sectionName, schoolLevel, gradeLevel, maxCapacity, nextSectionId } = req.body;

        await db.query(
            `UPDATE sections 
             SET section_name = ?, school_level = ?, grade_level = ?, max_capacity = ?, next_section_id = ?
             WHERE section_id = ?`,
            [sectionName, schoolLevel, gradeLevel, maxCapacity, nextSectionId || null, id]
        );

        res.json({ 
            success: true, 
            message: 'Section updated successfully' 
        });

    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            message: 'Failed to update section' 
        });
    }
};


// Get section details with students
const getSectionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [sections] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [id]
        );

        if (sections.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        const section = sections[0];

        // Get ACTIVE students only (is_current = 1)
        const [students] = await db.query(
            `SELECT s.*, ss.enrollment_id 
             FROM students s
             JOIN student_sections ss ON s.student_id = ss.student_id
             WHERE ss.section_id = ? AND ss.is_current = 1`,
            [id]
        );

        res.json({
            success: true,
            section,
            students
        });

    } catch (error) {
        console.error('Get section details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Assign students to section
const assignStudentToSection = async (req, res) => {
    try {
        const { studentId, sectionId, schoolYear } = req.body;

        if (!studentId || !sectionId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and section ID are required'
            });
        }

        // Check if student already assigned to another section this year
        const [existing] = await db.query(
            `SELECT * FROM student_sections 
             WHERE student_id = ? AND school_year = ? AND is_current = 1`,
            [studentId, schoolYear || '2025-2026']
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student already assigned to a section this year'
            });
        }

        // Insert assignment
        const [result] = await db.query(
            `INSERT INTO student_sections (student_id, section_id, school_year, enrolled_date, is_current)
             VALUES (?, ?, ?, CURDATE(), 1)`,
            [studentId, sectionId, schoolYear || '2025-2026']
        );

        // Update student's current grade
        const [section] = await db.query(
            'SELECT grade_level FROM sections WHERE section_id = ?',
            [sectionId]
        );

        if (section.length > 0) {
            await db.query(
                `UPDATE students SET current_grade_level = ? WHERE student_id = ?`,
                [section[0].grade_level, studentId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Student assigned to section successfully'
        });

    } catch (error) {
        console.error('Assign student error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to assign student'
        });
    }
};

// Remove student from section
const removeStudentFromSection = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        // Delete from student_sections
        const [result] = await db.query(
            `DELETE FROM student_sections 
             WHERE student_id = ? AND section_id = ?`,
            [studentId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ 
                error: 'Student not found in this section' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Student removed successfully' 
        });

    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({ 
            error: 'Failed to remove student',
            details: error.message 
        });
    }
};


// Get unassigned students for a section
const getUnassignedStudents = async (req, res) => {
    try {
        const { id } = req.params;

        // Get students NOT currently in this specific section (is_current = 1)
        const [students] = await db.query(
            `SELECT s.* FROM students s
             WHERE s.student_id NOT IN (
                SELECT student_id FROM student_sections 
                WHERE section_id = ? AND is_current = 1
             )
             AND s.enrollment_status = 'enrolled'
             ORDER BY s.first_name, s.last_name`,
            [id]
        );

        res.json({
            success: true,
            students: students || [],
            count: (students || []).length
        });

    } catch (error) {
        console.error('Get unassigned students error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error',
            message: error.message 
        });
    }
};


// Get section statistics
const getSectionStatistics = async (req, res) => {
    try {
        const { schoolYear } = req.query;

        const [stats] = await db.query(`
            SELECT 
                COUNT(DISTINCT s.section_id) as total_sections,
                SUM(CASE WHEN s.school_level = 'JHS' THEN 1 ELSE 0 END) as jhs_sections,
                SUM(CASE WHEN s.school_level = 'SHS' THEN 1 ELSE 0 END) as shs_sections,
                COUNT(ss.enrollment_id) as total_enrolled,
                COUNT(DISTINCT s.section_id) as active_sections
            FROM sections s
            LEFT JOIN student_sections ss ON s.section_id = ss.section_id 
                AND ss.is_current = 1
            WHERE s.school_year = ? AND s.is_active = 1
        `, [schoolYear || '2025-2026']);

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

// Get section by ID
const getSectionById = async (req, res) => {
    try {
        const { id } = req.params;

        const [sections] = await db.query(
            'SELECT * FROM sections WHERE section_id = ?',
            [id]
        );

        if (sections.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Section not found'
            });
        }

        res.json({
            success: true,
            section: sections[0]
        });

    } catch (error) {
        console.error('Get section error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch section'
        });
    }
};

// Get section subjects
const getSectionSubjects = async (req, res) => {
    try {
        const { id } = req.params;

        const [subjects] = await db.query(
            `SELECT subject_name FROM section_subjects 
             WHERE section_id = ? AND is_active = 1 
             ORDER BY subject_name`,
            [id]
        );

        res.json({
            success: true,
            subjects: subjects.map(s => s.subject_name)
        });

    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Server error', message: 'Failed to fetch subjects' });
    }
};

// Add subject to section
const addSubjectToSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name } = req.body;

        if (!subject_name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        // Check if already exists
        const [existing] = await db.query(
            `SELECT * FROM section_subjects 
             WHERE section_id = ? AND subject_name = ?`,
            [id, subject_name]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Subject already added to this section' });
        }

        await db.query(
            `INSERT INTO section_subjects (section_id, subject_name, is_active) 
             VALUES (?, ?, 1)`,
            [id, subject_name]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Subject added successfully' 
        });

    } catch (error) {
        console.error('Add subject error:', error);
        res.status(500).json({ error: 'Server error', message: 'Failed to add subject' });
    }
};

// Remove subject from section
const removeSubjectFromSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name } = req.body;

        await db.query(
            `UPDATE section_subjects SET is_active = 0 
             WHERE section_id = ? AND subject_name = ?`,
            [id, subject_name]
        );

        res.json({ 
            success: true, 
            message: 'Subject removed successfully' 
        });

    } catch (error) {
        console.error('Remove subject error:', error);
        res.status(500).json({ error: 'Server error', message: 'Failed to remove subject' });
    }
};

// Add delete section
const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `UPDATE sections SET is_active = 0 WHERE section_id = ?`,
            [id]
        );

        res.json({ 
            success: true, 
            message: 'Section deleted successfully' 
        });

    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({ error: 'Server error', message: 'Failed to delete section' });
    }
};

const promoteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { toSectionId, schoolYear } = req.body;

        if (!toSectionId || toSectionId === 'null') {
            return res.status(400).json({ 
                error: 'Target section required',
                message: 'Set next section in Manage Section Succession first'
            });
        }

        const [targetSection] = await db.query(
            `SELECT grade_level FROM sections WHERE section_id = ?`,
            [toSectionId]
        );

        if (targetSection.length === 0) {
            return res.status(400).json({ error: 'Target section not found' });
        }

        const newGrade = targetSection[0].grade_level;

        const [students] = await db.query(
            `SELECT student_id FROM student_sections WHERE section_id = ?`,
            [id]
        );

        if (students.length === 0) {
            return res.status(400).json({ error: 'No students in section' });
        }

        for (const student of students) {
            // Update student's grade
            await db.query(
                `UPDATE students SET current_grade_level = ? WHERE student_id = ?`,
                [newGrade, student.student_id]
            );

            // Mark old enrollment as inactive
            await db.query(
                `UPDATE student_sections SET is_current = 0 
                 WHERE student_id = ? AND section_id = ?`,
                [student.student_id, id]
            );

            // Add to new section
            await db.query(
                `INSERT INTO student_sections 
                 (student_id, section_id, school_year, is_current) 
                 VALUES (?, ?, ?, 1)`,
                [student.student_id, toSectionId, schoolYear]
            );
        }

        res.json({ 
            success: true, 
            message: `${students.length} students promoted to Grade ${newGrade}`,
            studentsPromoted: students.length
        });

    } catch (error) {
        console.error('Promote error:', error);
        res.status(500).json({ 
            error: 'Failed to promote',
            details: error.message 
        });
    }
};



module.exports = {
    getAllSections,
    createSection,
    getSectionDetails,
    updateSection,
    deleteSection,
    getSectionStatistics,
    assignStudentToSection,
    removeStudentFromSection,
    getUnassignedStudents,
    getSectionSubjects,
    addSubjectToSection,
    removeSubjectFromSection,
    promoteSection
};

