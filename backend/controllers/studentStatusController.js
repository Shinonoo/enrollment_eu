const db = require('../config/database');

// Get all completers (Grade 10 JHS)
const getCompleters = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        let query = `
            SELECT c.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level
            FROM completers c
            JOIN students s ON c.student_id = s.student_id
            WHERE s.school_year = ?
        `;
        const params = [year];

        if (search) {
            query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY c.completion_date DESC`;

        const [completers] = await db.query(query, params);

        res.json({
            success: true,
            count: completers.length,
            completers
        });

    } catch (error) {
        console.error('Get completers error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch completers'
        });
    }
};

// Mark student as completer
const markAsCompleter = async (req, res) => {
    try {
        const { studentId, completionYear, willContinueSHS } = req.body;

        if (!studentId || !completionYear) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and completion year are required'
            });
        }

        // Insert completer record
        const [result] = await db.query(
            `INSERT INTO completers (student_id, completion_year, completion_date, will_continue_shs)
             VALUES (?, ?, CURDATE(), ?)`,
            [studentId, completionYear, willContinueSHS ? 1 : 0]
        );

        // Update student status
        await db.query(
            `UPDATE students SET enrollment_status = 'completed' WHERE student_id = ?`,
            [studentId]
        );

        res.status(201).json({
            success: true,
            message: 'Student marked as completer',
            completerId: result.insertId
        });

    } catch (error) {
        console.error('Mark completer error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark as completer'
        });
    }
};

// Mark student as transferred out
const markAsTransferred = async (req, res) => {
    try {
        const { studentId, transferSchool, transferAddress, reason } = req.body;

        if (!studentId || !transferSchool) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and transfer school are required'
            });
        }

        // Insert transfer record
        const [result] = await db.query(
            `INSERT INTO transferred_out (student_id, transfer_date, transfer_school, transfer_address, reason, processed_by)
             VALUES (?, CURDATE(), ?, ?, ?, ?)`,
            [studentId, transferSchool, transferAddress || null, reason || null, req.user.userId]
        );

        // Update student status
        await db.query(
            `UPDATE students SET enrollment_status = 'transferred_out' WHERE student_id = ?`,
            [studentId]
        );

        res.status(201).json({
            success: true,
            message: 'Student marked as transferred out',
            transferId: result.insertId
        });

    } catch (error) {
        console.error('Mark transferred error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark as transferred'
        });
    }
};

// Get transferred out students
const getTransferredOut = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        let query = `
            SELECT t.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level,
                   u.full_name as processed_by_name
            FROM transferred_out t
            JOIN students s ON t.student_id = s.student_id
            LEFT JOIN users u ON t.processed_by = u.user_id
            WHERE s.school_year = ?
        `;
        const params = [year];

        if (search) {
            query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY t.transfer_date DESC`;

        const [transferred] = await db.query(query, params);

        res.json({
            success: true,
            count: transferred.length,
            transferred
        });

    } catch (error) {
        console.error('Get transferred error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch transferred students'
        });
    }
};

// Mark student as dropped
const markAsDropped = async (req, res) => {
    try {
        const { studentId, reason } = req.body;

        if (!studentId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID is required'
            });
        }

        // Insert drop record
        const [result] = await db.query(
            `INSERT INTO dropped_students (student_id, drop_date, reason, processed_by)
             VALUES (?, CURDATE(), ?, ?)`,
            [studentId, reason || null, req.user.userId]
        );

        // Update student status
        await db.query(
            `UPDATE students SET enrollment_status = 'dropped' WHERE student_id = ?`,
            [studentId]
        );

        res.status(201).json({
            success: true,
            message: 'Student marked as dropped',
            dropId: result.insertId
        });

    } catch (error) {
        console.error('Mark dropped error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark as dropped'
        });
    }
};

// Get dropped students
const getDropped = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        let query = `
            SELECT d.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level,
                   u.full_name as processed_by_name
            FROM dropped_students d
            JOIN students s ON d.student_id = s.student_id
            LEFT JOIN users u ON d.processed_by = u.user_id
            WHERE s.school_year = ?
        `;
        const params = [year];

        if (search) {
            query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY d.drop_date DESC`;

        const [dropped] = await db.query(query, params);

        res.json({
            success: true,
            count: dropped.length,
            dropped
        });

    } catch (error) {
        console.error('Get dropped error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch dropped students'
        });
    }
};

// Get graduated students
const getGraduated = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        let query = `
            SELECT g.*, s.student_number, s.first_name, s.last_name, s.school_level, s.current_grade_level
            FROM graduated_students g
            JOIN students s ON g.student_id = s.student_id
            WHERE g.graduation_year = ?
        `;
        const params = [year];

        if (search) {
            query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY g.graduation_date DESC`;

        const [graduated] = await db.query(query, params);

        res.json({
            success: true,
            count: graduated.length,
            graduated
        });

    } catch (error) {
        console.error('Get graduated error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch graduated students'
        });
    }
};

// Mark student as graduated
const markAsGraduated = async (req, res) => {
    try {
        const { studentId, graduationYear, strand, withHonors, honorType } = req.body;

        if (!studentId || !graduationYear) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and graduation year are required'
            });
        }

        // Insert graduation record
        const [result] = await db.query(
            `INSERT INTO graduated_students (student_id, graduation_date, graduation_year, strand, with_honors, honor_type)
             VALUES (?, CURDATE(), ?, ?, ?, ?)`,
            [studentId, graduationYear, strand || null, withHonors ? 1 : 0, honorType || null]
        );

        // Update student status
        await db.query(
            `UPDATE students SET enrollment_status = 'graduated' WHERE student_id = ?`,
            [studentId]
        );

        res.status(201).json({
            success: true,
            message: 'Student marked as graduated',
            graduationId: result.insertId
        });

    } catch (error) {
        console.error('Mark graduated error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark as graduated'
        });
    }
};

// Get status statistics
const getStatusStatistics = async (req, res) => {
    try {
        const { schoolYear } = req.query;
        const year = schoolYear || '2025-2026';

        const [stats] = await db.query(`
            SELECT 
                SUM(CASE WHEN enrollment_status = 'enrolled' THEN 1 ELSE 0 END) as enrolled,
                SUM(CASE WHEN enrollment_status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN enrollment_status = 'transferred_out' THEN 1 ELSE 0 END) as transferred_out,
                SUM(CASE WHEN enrollment_status = 'dropped' THEN 1 ELSE 0 END) as dropped,
                SUM(CASE WHEN enrollment_status = 'graduated' THEN 1 ELSE 0 END) as graduated,
                COUNT(*) as total
            FROM students
            WHERE school_year = ?
        `, [year]);

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
    getCompleters,
    markAsCompleter,
    getTransferredOut,
    markAsTransferred,
    getDropped,
    markAsDropped,
    getGraduated,
    markAsGraduated,
    getStatusStatistics
};
