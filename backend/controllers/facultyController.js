// controllers/facultyController.js - ONLY logic & responses
const FacultyModel = require('../models/facultyModel');

const getAllFaculty = async (req, res) => {
    try {
        const { department, position, search } = req.query;

        const faculty = await FacultyModel.getAllFaculty({
            department,
            position,
            search
        });

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

const createFaculty = async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, phoneNumber, department, position, qualifications, yearsOfService, isActive } = req.body;

        if (!firstName || !lastName || !email || !department || !position) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'First name, last name, email, department, and position are required'
            });
        }

        const result = await FacultyModel.createFaculty({
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            department,
            position,
            qualifications,
            yearsOfService,
            isActive
        });

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

const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await FacultyModel.getFacultyById(id);

        if (!faculty) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Faculty not found'
            });
        }

        res.json({
            success: true,
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

const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, middleName, lastName, email, phoneNumber, department, position, qualifications, yearsOfService, isActive } = req.body;

        await FacultyModel.updateFaculty(id, {
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            department,
            position,
            qualifications,
            yearsOfService,
            isActive
        });

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

const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        await FacultyModel.deleteFaculty(id);

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

const getFacultyStatistics = async (req, res) => {
    try {
        const statistics = await FacultyModel.getFacultyStatistics();

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
    getAllFaculty,
    createFaculty,
    getFacultyById,
    updateFaculty,
    deleteFaculty,
    getFacultyStatistics
};
