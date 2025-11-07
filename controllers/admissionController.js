const db = require('../config/database');
const { validationResult } = require('express-validator');

// Submit new admission application (public - no auth required)
const submitApplication = async (req, res) => {
    try {
        const {
            firstName, middleName, lastName, suffix,
            dateOfBirth, gender,
            email, phoneNumber,
            addressLine1, addressLine2, city, province, zipCode,
            guardianName, guardianRelationship, guardianPhone, guardianEmail,
            schoolLevel, gradeLevel, previousSchool, strand,
            applicationType
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Required fields: First Name, Last Name, Date of Birth, Gender'
            });
        }

        if (!addressLine1 || !city || !province) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Address fields are required'
            });
        }

        if (!guardianName || !guardianRelationship || !guardianPhone) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Guardian information is required'
            });
        }

        if (!schoolLevel || !gradeLevel || !applicationType) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'School Level, Grade Level, and Application Type are required'
            });
        }

        // Insert into database
        const [result] = await db.query(
            `INSERT INTO admission_applications (
                first_name, middle_name, last_name, suffix,
                date_of_birth, gender,
                email, phone_number,
                address_line1, address_line2, city, province, zip_code,
                guardian_name, guardian_relationship, guardian_phone, guardian_email,
                school_level, grade_level, previous_school, strand,
                application_type, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                firstName, middleName || null, lastName, suffix || null,
                dateOfBirth, gender,
                email || null, phoneNumber || null,
                addressLine1, addressLine2 || null, city, province, zipCode || null,
                guardianName, guardianRelationship, guardianPhone, guardianEmail || null,
                schoolLevel, gradeLevel, previousSchool || null, strand || null,
                applicationType, 'pending'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.insertId,
            referenceNumber: `APP-${result.insertId.toString().padStart(6, '0')}`
        });

    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to submit application',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all applications (for registrar) - FIXED: Removed duplicate filter
const getAllApplications = async (req, res) => {
    try {
        const { status, schoolLevel, gradeLevel, applicationType } = req.query;

        // Exclude 'enrolled' applications by default (they're now students)
        let query = `SELECT * FROM admission_applications WHERE status NOT IN ('enrolled', 'completed', 'dropped')`;
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (schoolLevel) {
            query += ' AND school_level = ?';
            params.push(schoolLevel);
        }

        if (gradeLevel) {
            query += ' AND grade_level = ?';
            params.push(gradeLevel);
        }

        if (applicationType) {
            query += ' AND application_type = ?';
            params.push(applicationType);
        }

        query += ' ORDER BY submitted_at DESC';

        const [applications] = await db.query(query, params);

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch applications'
        });
    }
};

// Get single application by ID
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await db.query(
            'SELECT * FROM admission_applications WHERE application_id = ?',
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            application: applications[0]
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch application'
        });
    }
};

// Update application status (approve/reject)
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, registrarNotes, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Status must be "approved" or "rejected"'
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Rejection reason is required'
            });
        }

        // Update application
        await db.query(
            `UPDATE admission_applications 
             SET status = ?, 
                 registrar_notes = ?,
                 rejection_reason = ?,
                 reviewed_by_registrar = ?,
                 reviewed_at = NOW()
             WHERE application_id = ?`,
            [status, registrarNotes, rejectionReason, req.user.userId, id]
        );

        // If approved, mark for accountant
        if (status === 'approved') {
            await db.query(
                `UPDATE admission_applications 
                 SET sent_to_accountant_at = NOW()
                 WHERE application_id = ?`,
                [id]
            );
        }

        res.json({
            success: true,
            message: `Application ${status} successfully`
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update application status'
        });
    }
};

// Update application details
const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName, middleName, lastName, suffix,
            dateOfBirth, gender,
            email, phoneNumber,
            addressLine1, addressLine2, city, province, zipCode,
            guardianName, guardianRelationship, guardianPhone, guardianEmail,
            schoolLevel, gradeLevel, previousSchool, strand,
            applicationType
        } = req.body;

        await db.query(
            `UPDATE admission_applications SET
                first_name = ?, middle_name = ?, last_name = ?, suffix = ?,
                date_of_birth = ?, gender = ?,
                email = ?, phone_number = ?,
                address_line1 = ?, address_line2 = ?, city = ?, province = ?, zip_code = ?,
                guardian_name = ?, guardian_relationship = ?, guardian_phone = ?, guardian_email = ?,
                school_level = ?, grade_level = ?, previous_school = ?, strand = ?,
                application_type = ?
             WHERE application_id = ?`,
            [
                firstName, middleName, lastName, suffix,
                dateOfBirth, gender,
                email, phoneNumber,
                addressLine1, addressLine2, city, province, zipCode,
                guardianName, guardianRelationship, guardianPhone, guardianEmail,
                schoolLevel, gradeLevel, previousSchool, strand,
                applicationType, id
            ]
        );

        res.json({
            success: true,
            message: 'Application updated successfully'
        });

    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update application'
        });
    }
};

// Get statistics
const getStatistics = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs,
                SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs
            FROM admission_applications
            WHERE status NOT IN ('enrolled', 'completed', 'dropped')
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

// Send approved applications to accountant
const sendToAccountant = async (req, res) => {
    try {
        const { applicationIds } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Application IDs array is required'
            });
        }

        await db.query(
            `UPDATE admission_applications 
             SET sent_to_accountant_at = NOW()
             WHERE application_id IN (?) AND status = 'approved'`,
            [applicationIds]
        );

        res.json({
            success: true,
            message: 'Applications sent to accountant successfully'
        });

    } catch (error) {
        console.error('Send to accountant error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to send to accountant'
        });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    updateApplication,
    getStatistics,
    sendToAccountant
};
