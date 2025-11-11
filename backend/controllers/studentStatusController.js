// controllers/studentStatusController.js - ONLY logic & responses
const StudentStatusModel = require('../models/studentStatusModel');

const getCompleters = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        const completers = await StudentStatusModel.getCompleters(year, search);

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

const markAsCompleter = async (req, res) => {
    try {
        const { studentId, completionYear, willContinueSHS } = req.body;

        if (!studentId || !completionYear) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and completion year are required'
            });
        }

        const result = await StudentStatusModel.insertCompleter(studentId, completionYear, willContinueSHS);
        await StudentStatusModel.updateStudentStatus(studentId, 'completed');

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

const getTransferredOut = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        const transferred = await StudentStatusModel.getTransferredOut(year, search);

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

const markAsTransferred = async (req, res) => {
    try {
        const { studentId, transferSchool, transferAddress, reason } = req.body;

        if (!studentId || !transferSchool) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and transfer school are required'
            });
        }

        const result = await StudentStatusModel.insertTransferred(
            studentId,
            transferSchool,
            transferAddress,
            reason,
            req.user.userId
        );
        await StudentStatusModel.updateStudentStatus(studentId, 'transferred_out');

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

const getDropped = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        const dropped = await StudentStatusModel.getDropped(year, search);

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

const markAsDropped = async (req, res) => {
    try {
        const { studentId, reason } = req.body;

        if (!studentId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID is required'
            });
        }

        const result = await StudentStatusModel.insertDropped(studentId, reason, req.user.userId);
        await StudentStatusModel.updateStudentStatus(studentId, 'dropped');

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

const getGraduated = async (req, res) => {
    try {
        const { schoolYear, search } = req.query;
        const year = schoolYear || '2025-2026';

        const graduated = await StudentStatusModel.getGraduated(year, search);

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

const markAsGraduated = async (req, res) => {
    try {
        const { studentId, graduationYear, strand, withHonors, honorType } = req.body;

        if (!studentId || !graduationYear) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Student ID and graduation year are required'
            });
        }

        const result = await StudentStatusModel.insertGraduated(
            studentId,
            graduationYear,
            strand,
            withHonors,
            honorType
        );
        await StudentStatusModel.updateStudentStatus(studentId, 'graduated');

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

const getStatusStatistics = async (req, res) => {
    try {
        const { schoolYear } = req.query;
        const year = schoolYear || '2025-2026';

        const statistics = await StudentStatusModel.getStatusStatistics(year);

        res.json({
            success: true,
            statistics
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
