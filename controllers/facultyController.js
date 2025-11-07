const db = require('../config/database');

// Get all faculty
const getAllFaculty = async (req, res) => {
    try {
        const { department, position, search } = req.query;

        let query = 'SELECT * FROM faculty WHERE 1=1';
        const params = [];

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (position) {
            query += ' AND position = ?';
            params.push(position);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY last_name, first_name';

        const [faculty] = await db.query(query, params);

        res.json({
            success: true,
            count: faculty.length,
            faculty
        });

    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch faculty'
        });
    }
};

// Create faculty
const createFaculty = async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, phoneNumber, department, position, qualifications, yearsOfService, isActive } = req.body;

        if (!firstName || !lastName || !email || !department || !position) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'First name, last name, email, department, and position are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO faculty (first_name, middle_name, last_name, email, phone_number, department, position, qualifications, years_of_service, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstName, middleName || null, lastName, email, phoneNumber || null, department, position, qualifications || null, yearsOfService || 0, isActive ? 1 : 0]
        );

        res.status(201).json({
            success: true,
            message: 'Faculty created successfully',
            facultyId: result.insertId
        });

    } catch (error) {
        console.error('Create faculty error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create faculty'
        });
    }
};

// Get faculty by ID
const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [faculty] = await db.query(
            'SELECT * FROM faculty WHERE faculty_id = ?',
            [id]
        );

        if (faculty.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Faculty not found'
            });
        }

        res.json({
            success: true,
            faculty: faculty[0]
        });

    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch faculty'
        });
    }
};

// Update faculty
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, middleName, lastName, email, phoneNumber, department, position, qualifications, yearsOfService, isActive } = req.body;

        await db.query(
            `UPDATE faculty 
             SET first_name = ?, middle_name = ?, last_name = ?, email = ?, phone_number = ?, 
                 department = ?, position = ?, qualifications = ?, years_of_service = ?, is_active = ?
             WHERE faculty_id = ?`,
            [firstName, middleName || null, lastName, email, phoneNumber || null, department, position, qualifications || null, yearsOfService || 0, isActive ? 1 : 0, id]
        );

        res.json({
            success: true,
            message: 'Faculty updated successfully'
        });

    } catch (error) {
        console.error('Update faculty error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update faculty'
        });
    }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE faculty SET is_active = 0 WHERE faculty_id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Faculty deleted successfully'
        });

    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to delete faculty'
        });
    }
};

// Get faculty statistics
const getFacultyStatistics = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_faculty,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_faculty,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_faculty,
                COUNT(DISTINCT department) as total_departments
            FROM faculty
        `);

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

module.exports = {
    getAllFaculty,
    createFaculty,
    getFacultyById,
    updateFaculty,
    deleteFaculty,
    getFacultyStatistics
};
