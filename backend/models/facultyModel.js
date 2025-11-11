// models/facultyModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getAllFaculty = async (filters) => {
    let query = 'SELECT * FROM faculty WHERE 1=1';
    const params = [];

    if (filters.department) {
        query += ' AND department = ?';
        params.push(filters.department);
    }

    if (filters.position) {
        query += ' AND position = ?';
        params.push(filters.position);
    }

    if (filters.search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY last_name, first_name';

    const [faculty] = await db.query(query, params);
    return faculty;
};

exports.createFaculty = async (data) => {
    const [result] = await db.query(
        `INSERT INTO faculty (first_name, middle_name, last_name, email, phone_number, department, position, qualifications, years_of_service, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.firstName, data.middleName || null, data.lastName, data.email, data.phoneNumber || null, data.department, data.position, data.qualifications || null, data.yearsOfService || 0, data.isActive ? 1 : 0]
    );
    return result;
};

exports.getFacultyById = async (id) => {
    const [faculty] = await db.query(
        'SELECT * FROM faculty WHERE faculty_id = ?',
        [id]
    );
    return faculty[0] || null;
};

exports.updateFaculty = async (id, data) => {
    await db.query(
        `UPDATE faculty 
         SET first_name = ?, middle_name = ?, last_name = ?, email = ?, phone_number = ?, 
             department = ?, position = ?, qualifications = ?, years_of_service = ?, is_active = ?
         WHERE faculty_id = ?`,
        [data.firstName, data.middleName || null, data.lastName, data.email, data.phoneNumber || null, data.department, data.position, data.qualifications || null, data.yearsOfService || 0, data.isActive ? 1 : 0, id]
    );
};

exports.deleteFaculty = async (id) => {
    await db.query(
        'UPDATE faculty SET is_active = 0 WHERE faculty_id = ?',
        [id]
    );
};

exports.getFacultyStatistics = async () => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total_faculty,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_faculty,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_faculty,
            COUNT(DISTINCT department) as total_departments
        FROM faculty
    `);
    return stats[0];
};
