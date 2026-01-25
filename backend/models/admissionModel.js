const db = require('../config/database');


// ============================================
// ADMISSION MODEL
// Manuel S. Enverga University Foundation Candelaria Inc.
// ============================================


const AdmissionModel = {


    // ============================================
    // UTILITY FUNCTIONS
    // ============================================


    /**
     * Generate unique application number
     * Format: MSEUFCI-YYYY-XXXX
     */
    generateApplicationNumber: () => {
        const prefix = 'MSEUFCI';
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${year}-${random}`;
    },


    // ============================================
    // CREATE OPERATIONS
    // ============================================


    /**
     * Create new admission application
     * @param {Object} admissionData - Complete admission form data
     * @returns {Object} { applicationNumber, admissionId }
     */
    createAdmission: async (admissionData) => {
        const connection = await db.getConnection();


        try {
            await connection.beginTransaction();


            // Get current active school year
            const [schoolYears] = await connection.query(
                'SELECT school_year_id FROM school_years WHERE is_current = TRUE LIMIT 1'
            );


            if (schoolYears.length === 0) {
                throw new Error('No active school year found. Please contact administrator.');
            }


            const schoolYearId = schoolYears[0].school_year_id;


            // Get grade_level_id
            const [gradeLevels] = await connection.query(
                'SELECT grade_level_id FROM grade_levels WHERE grade_name = ?',
                [admissionData.gradeLevel]
            );


            if (gradeLevels.length === 0) {
                throw new Error(`Invalid grade level: ${admissionData.gradeLevel}`);
            }


            const gradeLevelId = gradeLevels[0].grade_level_id;


            // Get strand_id if SHS
            let strandId = null;
            if (admissionData.schoolLevel === 'SHS' && admissionData.strand) {
                const [strands] = await connection.query(
                    'SELECT strand_id FROM strands WHERE strand_code = ? OR strand_name LIKE ?',
                    [admissionData.strand, `%${admissionData.strand}%`]
                );


                if (strands.length > 0) {
                    strandId = strands[0].strand_id;
                }
            }


            // Check if LRN already exists
            const [existingLRN] = await connection.query(
                'SELECT admission_id FROM applicants_academic WHERE lrn = ?',
                [admissionData.lrn]
            );


            if (existingLRN.length > 0) {
                throw new Error('LRN already registered. If you are a returning student, please use the re-enrollment process.');
            }


            // Generate unique application number
            const applicationNumber = AdmissionModel.generateApplicationNumber();


            // Insert main admission record
            const [admissionResult] = await connection.query(`
                INSERT INTO admissions (
                    application_number, school_year_id, application_type,
                    grade_level_id, strand_id, school_level,
                    current_status, submitted_at
                ) VALUES (?, ?, 'new', ?, ?, ?, 'submitted', NOW())
            `, [applicationNumber, schoolYearId, gradeLevelId, strandId, admissionData.schoolLevel]);


            const admissionId = admissionResult.insertId;


            // Insert personal information
            await connection.query(`
                INSERT INTO applicants_personal_info (
                    admission_id, first_name, middle_name, last_name, suffix,
                    date_of_birth, age, gender, place_of_birth, nationality,
                    email, phone_number, photo_filename, photo_path, photo_uploaded_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                admissionId,
                admissionData.firstName,
                admissionData.middleName,
                admissionData.lastName,
                admissionData.suffix,
                admissionData.dateOfBirth,
                admissionData.age,
                admissionData.gender,
                admissionData.placeOfBirth,
                admissionData.nationality,
                admissionData.email,
                admissionData.phoneNumber,
                admissionData.studentPhotoName,
                admissionData.studentPhotoPath
            ]);


            // Insert address information
            await connection.query(`
                INSERT INTO applicants_address (
                    admission_id, street_address, barangay,
                    city_municipality, province, zip_code
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                admissionId,
                admissionData.streetAddress,
                admissionData.barangay,
                admissionData.city,
                admissionData.province,
                admissionData.zipCode
            ]);


            // Insert primary guardian information
            await connection.query(`
                INSERT INTO applicants_guardians (
                    admission_id, guardian_name, guardian_relationship,
                    guardian_phone, guardian_email, guardian_address, is_primary
                ) VALUES (?, ?, ?, ?, ?, ?, TRUE)
            `, [
                admissionId,
                admissionData.guardianName,
                admissionData.guardianRelationship,
                admissionData.guardianPhone,
                admissionData.guardianEmail,
                admissionData.guardianAddress
            ]);


            // Insert academic information
            await connection.query(`
                INSERT INTO applicants_academic (
                    admission_id, lrn, previous_school_name,
                    last_grade_completed, year_completed, general_average,
                    referral_source
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                admissionId,
                admissionData.lrn,
                admissionData.previousSchool,
                admissionData.lastGradeCompleted,
                admissionData.yearCompleted,
                admissionData.generalAverage,
                admissionData.referralSource
            ]);


            // Log initial workflow status
            await connection.query(`
                INSERT INTO admission_workflow (
                    admission_id, from_status, to_status, changed_by, remarks, changed_at
                ) VALUES (?, NULL, 'submitted', NULL, 'Online application submitted', NOW())
            `, [admissionId]);


            await connection.commit();


            return {
                applicationNumber,
                admissionId
            };


        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },


    // ============================================
    // READ OPERATIONS
    // ============================================


    /**
     * Get all admissions with optional filters
     * @param {Object} filters - { status, schoolLevel, gradeLevel, applicationType }
     * @returns {Array} Array of admission records
     */
    getAllAdmissions: async (filters = {}) => {
        try {
            let sql = `
                SELECT 
                    a.admission_id,
                    a.application_number,
                    a.application_type,
                    a.school_level,
                    a.current_status as status,
                    a.submitted_at,
                    a.approved_at,
                    a.sent_to_accounting_at,
                    p.first_name,
                    p.middle_name,
                    p.last_name,
                    p.suffix,
                    p.email,
                    p.phone_number,
                    g.grade_name as grade_level,
                    s.strand_code as strand,
                    sy.year_label as school_year
                FROM admissions a
                LEFT JOIN applicants_personal_info p ON a.admission_id = p.admission_id
                LEFT JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
                LEFT JOIN strands s ON a.strand_id = s.strand_id
                LEFT JOIN school_years sy ON a.school_year_id = sy.school_year_id
                WHERE 1=1
            `;


            const params = [];


            // Apply filters dynamically
            if (filters.status) {
                sql += ' AND a.current_status = ?';
                params.push(filters.status);
            }


            if (filters.schoolLevel) {
                sql += ' AND a.school_level = ?';
                params.push(filters.schoolLevel);
            }


            if (filters.gradeLevel) {
                sql += ' AND g.grade_name = ?';
                params.push(`Grade ${filters.gradeLevel}`);
            }


            if (filters.applicationType) {
                sql += ' AND a.application_type = ?';
                params.push(filters.applicationType);
            }


            sql += ' ORDER BY a.submitted_at DESC';


            const [admissions] = await db.query(sql, params);
            return admissions;


        } catch (error) {
            throw error;
        }
    },


    /**
     * Get admission by application number
     * @param {String} applicationNumber - Unique application number
     * @returns {Object|null} Admission record or null
     */
    getAdmissionByApplicationNumber: async (applicationNumber) => {
        try {
            const [admissions] = await db.query(`
                SELECT 
                    a.*,
                    p.first_name, p.middle_name, p.last_name, p.suffix,
                    p.date_of_birth, p.age, p.gender, p.place_of_birth, p.nationality,
                    p.email, p.phone_number, p.photo_path,
                    addr.street_address, addr.barangay, addr.city_municipality, 
                    addr.province, addr.zip_code,
                    g.grade_name, g.school_level,
                    s.strand_name, s.strand_code,
                    sy.year_label,
                    guard.guardian_name, guard.guardian_relationship, 
                    guard.guardian_phone, guard.guardian_email,
                    ac.lrn, ac.previous_school_name, ac.general_average
                FROM admissions a
                LEFT JOIN applicants_personal_info p ON a.admission_id = p.admission_id
                LEFT JOIN applicants_address addr ON a.admission_id = addr.admission_id
                LEFT JOIN applicants_guardians guard ON a.admission_id = guard.admission_id AND guard.is_primary = TRUE
                LEFT JOIN applicants_academic ac ON a.admission_id = ac.admission_id
                LEFT JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
                LEFT JOIN strands s ON a.strand_id = s.strand_id
                LEFT JOIN school_years sy ON a.school_year_id = sy.school_year_id
                WHERE a.application_number = ?
            `, [applicationNumber]);


            return admissions.length > 0 ? admissions[0] : null;


        } catch (error) {
            throw error;
        }
    },


    /**
     * Get admission by ID with full details
     * @param {Number} admissionId - Admission ID
     * @returns {Object|null} Full admission record or null
     */
    getAdmissionById: async (admissionId) => {
        try {
            const [admissions] = await db.query(`
                SELECT 
                    a.*,
                    p.first_name, p.middle_name, p.last_name, p.suffix,
                    p.date_of_birth, p.age, p.gender, p.place_of_birth, p.nationality,
                    p.email, p.phone_number, p.photo_path,
                    addr.street_address, addr.barangay, addr.city_municipality, 
                    addr.province, addr.zip_code,
                    g.grade_name, g.school_level,
                    s.strand_name, s.strand_code,
                    sy.year_label,
                    guard.guardian_name, guard.guardian_relationship, 
                    guard.guardian_phone, guard.guardian_email, guard.guardian_address,
                    ac.lrn, ac.previous_school_name, ac.last_grade_completed,
                    ac.year_completed, ac.general_average, ac.referral_source
                FROM admissions a
                LEFT JOIN applicants_personal_info p ON a.admission_id = p.admission_id
                LEFT JOIN applicants_address addr ON a.admission_id = addr.admission_id
                LEFT JOIN applicants_guardians guard ON a.admission_id = guard.admission_id AND guard.is_primary = TRUE
                LEFT JOIN applicants_academic ac ON a.admission_id = ac.admission_id
                LEFT JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
                LEFT JOIN strands s ON a.strand_id = s.strand_id
                LEFT JOIN school_years sy ON a.school_year_id = sy.school_year_id
                WHERE a.admission_id = ?
            `, [admissionId]);


            return admissions.length > 0 ? admissions[0] : null;


        } catch (error) {
            throw error;
        }
    },


    /**
     * Get pending admissions (for registrar dashboard)
     * @returns {Array} Array of pending admission records
     */
    getPendingAdmissions: async () => {
        try {
            const [admissions] = await db.query(`
                SELECT 
                    a.admission_id,
                    a.application_number,
                    a.current_status,
                    a.submitted_at,
                    p.first_name,
                    p.middle_name,
                    p.last_name,
                    p.email,
                    p.phone_number,
                    g.grade_name,
                    s.strand_name,
                    sy.year_label
                FROM admissions a
                LEFT JOIN applicants_personal_info p ON a.admission_id = p.admission_id
                LEFT JOIN grade_levels g ON a.grade_level_id = g.grade_level_id
                LEFT JOIN strands s ON a.strand_id = s.strand_id
                LEFT JOIN school_years sy ON a.school_year_id = sy.school_year_id
                WHERE a.current_status IN ('submitted', 'pending_verification', 'documents_verified')
                ORDER BY a.submitted_at DESC
            `);


            return admissions;


        } catch (error) {
            throw error;
        }
    },


    // ============================================
    // UPDATE OPERATIONS
    // ============================================


    /**
     * Update admission status with workflow logging
     * @param {Number} admissionId - Admission ID
     * @param {String} newStatus - New status value
     * @param {String} remarks - Optional remarks
     * @param {Number} userId - User making the change
     */
    updateAdmissionStatus: async (admissionId, newStatus, remarks = null, userId = null) => {
        const connection = await db.getConnection();


        try {
            await connection.beginTransaction();


            // Get current status
            const [current] = await connection.query(
                'SELECT current_status FROM admissions WHERE admission_id = ?',
                [admissionId]
            );


            if (current.length === 0) {
                throw new Error('Admission not found');
            }


            const currentStatus = current[0].current_status;


            // Update admission status
            await connection.query(
                'UPDATE admissions SET current_status = ?, updated_at = NOW() WHERE admission_id = ?',
                [newStatus, admissionId]
            );


            // Update approved_at timestamp if status is approved
            if (newStatus === 'approved') {
                await connection.query(
                    'UPDATE admissions SET approved_at = NOW() WHERE admission_id = ?',
                    [admissionId]
                );
            }


            // Log workflow change
            await connection.query(`
                INSERT INTO admission_workflow (
                    admission_id, from_status, to_status, changed_by, remarks, changed_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `, [admissionId, currentStatus, newStatus, userId, remarks]);


            await connection.commit();


        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },


    /**
     * Send approved applications to accounting
     * @param {Array} applicationIds - Array of admission IDs
     * @returns {Object} Result of the update operation
     */
    sendToAccounting: async (applicationIds) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const placeholders = applicationIds.map(() => '?').join(',');
            const query = `
                UPDATE admissions 
                SET sent_to_accounting_at = NOW(),
                    current_status = 'sent_to_accounting'
                WHERE admission_id IN (${placeholders})
                AND current_status = 'approved'
            `;
            
            const [result] = await connection.query(query, applicationIds);
            
            // Log workflow change for each application
            for (const admissionId of applicationIds) {
                await connection.query(`
                    INSERT INTO admission_workflow (
                        admission_id, from_status, to_status, changed_by, remarks, changed_at
                    ) VALUES (?, 'approved', 'sent_to_accounting', NULL, 'Sent to accounting for payment processing', NOW())
                `, [admissionId]);
            }
            
            await connection.commit();
            return result;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};


module.exports = AdmissionModel;
