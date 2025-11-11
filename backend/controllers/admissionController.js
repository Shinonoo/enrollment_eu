// controllers/admissionController.js - COMPLETE

const AdmissionModel = require('../models/admissionModel');

// ============================================
// 1. Submit Application (PUBLIC)
// ============================================

const submitApplication = async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name, suffix,
            date_of_birth, gender,
            email, phone_number,
            street, barangay, city, province, zip_code,
            guardian_name, guardian_relationship, guardian_phone, guardian_email,
            school_level, grade_level, previous_school, strand,
            application_type
        } = req.body;

        // Validate
        if (!first_name || !last_name || !date_of_birth || !gender) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Required fields: First Name, Last Name, Date of Birth, Gender'
            });
        }

        if (!street || !city || !province) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Address fields (Street, City, Province) are required'
            });
        }

        if (!guardian_name || !guardian_relationship || !guardian_phone) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Guardian information is required'
            });
        }

        if (!school_level || !grade_level || !application_type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'School Level, Grade Level, and Application Type are required'
            });
        }

        const result = await AdmissionModel.createAdmission({
            firstName: first_name,
            middleName: middle_name,
            lastName: last_name,
            suffix: suffix,
            dateOfBirth: date_of_birth,
            gender: gender,
            email: email,
            phoneNumber: phone_number,
            street: street,
            barangay: barangay,
            city: city,
            province: province,
            zipCode: zip_code,
            guardianName: guardian_name,
            guardianRelationship: guardian_relationship,
            guardianPhone: guardian_phone,
            guardianEmail: guardian_email,
            schoolLevel: school_level,
            gradeLevel: grade_level,
            previousSchool: previous_school,
            strand: strand,
            applicationType: application_type
        });

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

// ============================================
// 2. Get All Applications (PROTECTED)
// ============================================

const getAllApplications = async (req, res) => {
    try {
        const { status, schoolLevel, gradeLevel, applicationType } = req.query;

        const applications = await AdmissionModel.getAllAdmissions({
            status, schoolLevel, gradeLevel, applicationType
        });

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

// ============================================
// 3. Get Application by ID (PROTECTED)
// ============================================

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await AdmissionModel.getAdmissionById(id);

        if (!application) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            application
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch application'
        });
    }
};

// ============================================
// 4. Update Application Status (PROTECTED)
// ============================================

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

        await AdmissionModel.updateAdmissionStatus(id, status, registrarNotes, rejectionReason, req.user?.userId);

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

// ============================================
// 5. Update Application (PROTECTED)
// ============================================

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name, middle_name, last_name, suffix,
            date_of_birth, gender,
            email, phone_number,
            street, barangay, city, province, zip_code,
            guardian_name, guardian_relationship, guardian_phone, guardian_email,
            school_level, grade_level, previous_school, strand,
            application_type
        } = req.body;

        await AdmissionModel.updateApplication(id, {
            firstName: first_name,
            middleName: middle_name,
            lastName: last_name,
            suffix: suffix,
            dateOfBirth: date_of_birth,
            gender: gender,
            email: email,
            phoneNumber: phone_number,
            street: street,
            barangay: barangay,
            city: city,
            province: province,
            zipCode: zip_code,
            guardianName: guardian_name,
            guardianRelationship: guardian_relationship,
            guardianPhone: guardian_phone,
            guardianEmail: guardian_email,
            schoolLevel: school_level,
            gradeLevel: grade_level,
            previousSchool: previous_school,
            strand: strand,
            applicationType: application_type
        });

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

// ============================================
// 6. Get Statistics (PROTECTED)
// ============================================

const getStatistics = async (req, res) => {
    try {
        const statistics = await AdmissionModel.getStatistics();

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

// ============================================
// 7. Send to Accountant (PROTECTED)
// ============================================

const sendToAccountant = async (req, res) => {
    try {
        const { applicationIds } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Application IDs array is required'
            });
        }

        await AdmissionModel.sendToAccountant(applicationIds);

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

// ============================================
// EXPORTS
// ============================================

module.exports = {
    submitApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    updateApplication,
    getStatistics,
    sendToAccountant
};
