// models/subjectsModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getAllSubjects = async () => {
    const [subjects] = await db.query(
        `SELECT * FROM subjects WHERE is_active = 1 ORDER BY school_level, grade_level, subject_name`
    );
    return subjects;
};

exports.getSubjectsByLevel = async (schoolLevel, gradeLevel) => {
    const [subjects] = await db.query(
        `SELECT * FROM subjects WHERE is_active = 1 AND school_level = ? AND grade_level = ? ORDER BY subject_name`,
        [schoolLevel, gradeLevel]
    );
    return subjects;
};
