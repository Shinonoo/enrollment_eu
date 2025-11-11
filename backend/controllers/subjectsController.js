const db = require('../config/database');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await db.query(
            `SELECT * FROM subjects ORDER BY school_level, grade_level, subject_name`
        );
        res.json({ subjects });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create subject
exports.createSubject = async (req, res) => {
    try {
        const { subject_code, subject_name, school_level, grade_level, strand, units, semester, is_required, description } = req.body;

        const [result] = await db.query(
            `INSERT INTO subjects (subject_code, subject_name, school_level, grade_level, strand, units, semester, is_required, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subject_code, subject_name, school_level, grade_level, strand, units, semester, is_required, description]
        );

        res.json({ success: true, subject_id: result.insertId });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Subject code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get subject detail
exports.getSubjectDetail = async (req, res) => {
    try {
        const { subject_id } = req.params;

        const [subject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subject_id]
        );

        if (subject.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ subject: subject[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update subject
exports.updateSubject = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const { subject_code, subject_name, school_level, grade_level, strand, units, semester, is_required, description } = req.body;

        await db.query(
            `UPDATE subjects 
             SET subject_code = ?, subject_name = ?, school_level = ?, grade_level = ?, 
                 strand = ?, units = ?, semester = ?, is_required = ?, description = ?
             WHERE subject_id = ?`,
            [subject_code, subject_name, school_level, grade_level, strand, units, semester, is_required, description, subject_id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Subject code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
    try {
        const { subject_id } = req.params;
        await db.query(`DELETE FROM subjects WHERE subject_id = ?`, [subject_id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Toggle status
exports.toggleStatus = async (req, res) => {
    try {
        const { subject_id } = req.params;
        await db.query(
            `UPDATE subjects SET is_active = NOT is_active WHERE subject_id = ?`,
            [subject_id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get subjects by level (keep for backward compatibility)
exports.getSubjectsByLevel = async (req, res) => {
    try {
        const { school_level, grade_level } = req.query;

        const [subjects] = await db.query(
            `SELECT * FROM subjects WHERE is_active = 1 AND school_level = ? AND grade_level = ? ORDER BY subject_name`,
            [school_level, grade_level]
        );
        res.json({ subjects });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
