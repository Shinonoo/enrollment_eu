// models/curriculumModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getAllCurricula = async () => {
    const [curricula] = await db.query(`
        SELECT 
            c.*,
            COUNT(cs.curriculum_subject_id) as subject_count
        FROM curricula c
        LEFT JOIN curriculum_subjects cs ON c.curriculum_id = cs.curriculum_id
        GROUP BY c.curriculum_id
        ORDER BY c.school_level, c.grade_level, c.curriculum_name
    `);
    return curricula;
};

exports.createCurriculum = async (data) => {
    const [result] = await db.query(
        `INSERT INTO curricula (curriculum_code, curriculum_name, school_level, grade_level, strand, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.curriculum_code, data.curriculum_name, data.school_level, data.grade_level, data.strand || null, data.description]
    );
    return result;
};

exports.addSubjectsToCurriculum = async (curriculumId, subjects) => {
    if (subjects && subjects.length > 0) {
        const subjectInserts = subjects.map(subject_id => [curriculumId, subject_id, 'Both', 1]);
        await db.query(
            `INSERT INTO curriculum_subjects (curriculum_id, subject_id, semester, is_required) VALUES ?`,
            [subjectInserts]
        );
    }
};

exports.getCurriculumDetail = async (curriculumId) => {
    const [curriculum] = await db.query(
        `SELECT * FROM curricula WHERE curriculum_id = ?`,
        [curriculumId]
    );
    return curriculum[0] || null;
};

exports.getCurriculumSubjects = async (curriculumId) => {
    const [subjects] = await db.query(
        `SELECT 
            cs.*,
            s.subject_code,
            s.subject_name,
            s.units
        FROM curriculum_subjects cs
        JOIN subjects s ON cs.subject_id = s.subject_id
        WHERE cs.curriculum_id = ?
        ORDER BY s.subject_name`,
        [curriculumId]
    );
    return subjects;
};

exports.updateCurriculum = async (curriculumId, data) => {
    await db.query(
        `UPDATE curricula 
         SET curriculum_code = ?, curriculum_name = ?, school_level = ?, grade_level = ?, strand = ?, description = ?
         WHERE curriculum_id = ?`,
        [data.curriculum_code, data.curriculum_name, data.school_level, data.grade_level, data.strand || null, data.description, curriculumId]
    );
};

exports.deleteSubjectsFromCurriculum = async (curriculumId) => {
    await db.query(`DELETE FROM curriculum_subjects WHERE curriculum_id = ?`, [curriculumId]);
};

exports.deleteCurriculum = async (curriculumId) => {
    await db.query(`DELETE FROM curricula WHERE curriculum_id = ?`, [curriculumId]);
};

exports.toggleStatus = async (curriculumId) => {
    await db.query(
        `UPDATE curricula SET is_active = NOT is_active WHERE curriculum_id = ?`,
        [curriculumId]
    );
};

exports.addSubjectToCurriculum = async (curriculumId, subjectId, semester, isRequired) => {
    await db.query(
        `INSERT INTO curriculum_subjects (curriculum_id, subject_id, semester, is_required) VALUES (?, ?, ?, ?)`,
        [curriculumId, subjectId, semester || 'Both', isRequired || 1]
    );
};

exports.removeSubjectFromCurriculum = async (curriculumId, subjectId) => {
    await db.query(
        `DELETE FROM curriculum_subjects WHERE curriculum_id = ? AND subject_id = ?`,
        [curriculumId, subjectId]
    );
};
