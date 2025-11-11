// controllers/curriculumController.js - ONLY logic & responses
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

exports.getCurriculumDetail = async (req, res) => {
    try {
        const { curriculum_id } = req.params;

        const curriculum = await CurriculumModel.getCurriculumDetail(curriculum_id);

        if (!curriculum) {
            return res.status(404).json({ error: 'Curriculum not found' });
        }

        const subjects = await CurriculumModel.getCurriculumSubjects(curriculum_id);

        res.json({ curriculum, subjects });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
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
        const { curriculum_id } = req.params;
        await CurriculumModel.deleteCurriculum(curriculum_id);
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

exports.addSubjectToCurriculum = async (req, res) => {
    try {
        const { curriculum_id } = req.params;
        const { subject_id, semester, is_required } = req.body;

        await CurriculumModel.addSubjectToCurriculum(curriculum_id, subject_id, semester, is_required);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Subject already in curriculum' });
        }
        res.status(500).json({ error: error.message });
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
