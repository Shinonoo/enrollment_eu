// controllers/curriculumController.js - ONLY logic & responses
const db = require('../config/database');
const CurriculumModel = require('../models/curriculumModel');

exports.getAllCurricula = async (req, res) => {
    try {
        const curricula = await CurriculumModel.getAllCurricula();
        res.json({ curricula });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createCurriculum = async (req, res) => {
    try {
        const { curriculum_code, curriculum_name, school_level, grade_level, strand, description, subjects } = req.body;

        const result = await CurriculumModel.createCurriculum({
            curriculum_code,
            curriculum_name,
            school_level,
            grade_level,
            strand,
            description
        });

        const curriculum_id = result.insertId;

        if (subjects && subjects.length > 0) {
            await CurriculumModel.addSubjectsToCurriculum(curriculum_id, subjects);
        }

        res.json({ success: true, curriculum_id });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Curriculum code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get curriculum details WITH subjects
exports.getCurriculumDetail = async (req, res) => {
    try {
        const { curriculum_id } = req.params;
        
        console.log('📚 Getting curriculum details for ID:', curriculum_id);
        
        // Get curriculum info
        const [curriculumRows] = await db.query(`
            SELECT * FROM curricula WHERE curriculum_id = ?
        `, [curriculum_id]);
        
        if (!curriculumRows || curriculumRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curriculum not found'
            });
        }
        
        const curriculum = curriculumRows[0];
        
        // Get subjects for this curriculum
        const [subjects] = await db.query(`
            SELECT 
                s.subject_id,
                s.subject_name,
                s.subject_code,
                cs.semester,
                cs.is_required,
                cs.curriculum_subject_id
            FROM curriculum_subjects cs
            JOIN subjects s ON cs.subject_id = s.subject_id
            WHERE cs.curriculum_id = ?
            ORDER BY cs.is_required DESC, s.subject_name ASC
        `, [curriculum_id]);
        
        console.log('✅ Found curriculum with', subjects.length, 'subjects');
        
        res.json({
            success: true,
            curriculum: curriculum,
            subjects: subjects || []
        });
    } catch (error) {
        console.error('❌ Error getting curriculum details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching curriculum details',
            error: error.message
        });
    }
};


exports.updateCurriculum = async (req, res) => {
    try {
        const { curriculum_id } = req.params;
        const { curriculum_code, curriculum_name, school_level, grade_level, strand, description, subjects } = req.body;

        await CurriculumModel.updateCurriculum(curriculum_id, {
            curriculum_code,
            curriculum_name,
            school_level,
            grade_level,
            strand,
            description
        });

        if (subjects && subjects.length > 0) {
            await CurriculumModel.deleteSubjectsFromCurriculum(curriculum_id);
            await CurriculumModel.addSubjectsToCurriculum(curriculum_id, subjects);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Curriculum code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCurriculum = async (req, res) => {
    try {
        const { curriculumid } = req.params;
        await CurriculumModel.deleteCurriculum(curriculumid);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { curriculum_id } = req.params;
        await CurriculumModel.toggleStatus(curriculum_id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// curriculumController.js
exports.addSubjectToCurriculum = async (req, res) => {
    try {
        const { curriculum_id } = req.params;
        const { subject_id, semester = 'Both', is_required = 1 } = req.body;

        // Insert and ignore if duplicate
        await db.query(
            `INSERT IGNORE INTO curriculum_subjects (curriculum_id, subject_id, semester, is_required)
             VALUES (?, ?, ?, ?)`,
            [curriculum_id, subject_id, semester, is_required]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.removeSubjectFromCurriculum = async (req, res) => {
    try {
        const { curriculum_id, subject_id } = req.params;
        await CurriculumModel.removeSubjectFromCurriculum(curriculum_id, subject_id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get curriculum with subjects
exports.getCurriculumDetails = async (req, res) => {
    try {
        const { curriculumId } = req.params;
        
        console.log('📚 Getting curriculum details:', curriculumId);
        
        // Get curriculum info
        const [curriculum] = await db.query(`
            SELECT * FROM curricula WHERE curriculum_id = ?
        `, [curriculumId]);
        
        if (!curriculum || curriculum.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curriculum not found'
            });
        }
        
        // Get subjects for this curriculum
        const [subjects] = await db.query(`
            SELECT 
                s.subject_id,
                s.subject_name,
                s.subject_code,
                cs.semester,
                cs.is_required
            FROM curriculum_subjects cs
            JOIN subjects s ON cs.subject_id = s.subject_id
            WHERE cs.curriculum_id = ?
            ORDER BY cs.is_required DESC, s.subject_name ASC
        `, [curriculumId]);
        
        console.log('✅ Found', subjects.length, 'subjects');
        
        res.json({
            success: true,
            curriculum: curriculum[0],
            subjects: subjects
        });
    } catch (error) {
        console.error('❌ Error getting curriculum details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching curriculum details',
            error: error.message
        });
    }
};
