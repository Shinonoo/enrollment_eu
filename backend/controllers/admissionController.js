// ============================================
// ADMISSION CONTROLLER
// Manuel S. Enverga University Foundation Candelaria Inc.
// ============================================
const AdmissionModel = require('../models/admissionModel');

const admissionController = {

    // Submit new admission application
    submitAdmission: async (req, res) => {
        try {
            const {
                // Personal Info
                firstName, middleName, lastName, suffix,
                dateOfBirth, age, gender, placeOfBirth, nationality,

                // Contact Info
                email, phoneNumber,
                streetAddress, barangay, city, province, zipCode,

                // Guardian Info
                guardianName, guardianRelationship, guardianPhone,
                guardianEmail, guardianAddress,

                // Academic Info
                lrn, schoolLevel, gradeLevel, strand,
                previousSchool, lastGradeCompleted, yearCompleted,
                generalAverage, academicHonor, referralSource
            } = req.body;

            // Get uploaded photo info
            let studentPhotoName = null;
            let studentPhotoPath = null;

            if (req.file) {
                studentPhotoName = req.file.filename;
                studentPhotoPath = '/uploads/student_photos/' + req.file.filename;
            }

            // Prepare admission data object
            const admissionData = {
                // Personal
                firstName,
                middleName: middleName || null,
                lastName,
                suffix: suffix || null,
                dateOfBirth,
                age: parseInt(age),
                gender,
                placeOfBirth,
                nationality,

                // Contact
                email: email || null,
                phoneNumber: phoneNumber || null,
                streetAddress,
                barangay,
                city,
                province,
                zipCode: zipCode || null,

                // Guardian
                guardianName,
                guardianRelationship,
                guardianPhone,
                guardianEmail: guardianEmail || null,
                guardianAddress: guardianAddress || null,

                // Academic
                lrn,
                schoolLevel,
                gradeLevel,
                strand: strand || null,
                previousSchool,
                lastGradeCompleted,
                yearCompleted,
                generalAverage: parseFloat(generalAverage),
                academicHonor: academicHonor || null,
                referralSource: referralSource || null,

                // Photo
                studentPhotoName,
                studentPhotoPath
            };

            // Call model to create admission
            const result = await AdmissionModel.createAdmission(admissionData);

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                applicationNumber: result.applicationNumber,
                admissionId: result.admissionId
            });

        } catch (error) {
            console.error('Admission submission error:', error);

            // Handle specific errors
            if (error.message.includes('LRN already registered')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to submit application'
            });
        }
    },

    // Get admission status by application number
    getAdmissionStatus: async (req, res) => {
        try {
            const { applicationNumber } = req.params;

            const admission = await AdmissionModel.getAdmissionByApplicationNumber(applicationNumber);

            if (!admission) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            res.json({
                success: true,
                admission
            });

        } catch (error) {
            console.error('Error fetching admission:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch admission status'
            });
        }
    },

    // Get all pending admissions (for registrar dashboard)
    getPendingAdmissions: async (req, res) => {
        try {
            const admissions = await AdmissionModel.getPendingAdmissions();

            res.json({
                success: true,
                count: admissions.length,
                admissions
            });

        } catch (error) {
            console.error('Error fetching pending admissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch pending admissions'
            });
        }
    },

    // Get admission by ID
    getAdmissionById: async (req, res) => {
        try {
            const { admissionId } = req.params;

            const admission = await AdmissionModel.getAdmissionById(admissionId);

            if (!admission) {
                return res.status(404).json({
                    success: false,
                    message: 'Admission not found'
                });
            }

            res.json({
                success: true,
                admission
            });

        } catch (error) {
            console.error('Error fetching admission:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch admission details'
            });
        }
    },

    // Update admission status (for registrar workflow)
    updateAdmissionStatus: async (req, res) => {
        try {
            const { admissionId } = req.params;
            const { status, remarks, userId } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            await AdmissionModel.updateAdmissionStatus(admissionId, status, remarks, userId);

            res.json({
                success: true,
                message: 'Admission status updated successfully'
            });

        } catch (error) {
            console.error('Error updating admission status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update admission status'
            });
        }
    }
};

module.exports = admissionController;