const db = require('../config/database');

class SectionModel {
    // Get all sections with progression info
    static async getAllSections() {
        try {
            const [results] = await db.query(`
                SELECT s.*, 
                       ns.section_name as next_section_name
                FROM sections s
                LEFT JOIN sections ns ON s.next_section_id = ns.section_id
                ORDER BY s.grade_level, s.section_name
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Get sections with filters - STATUS REMOVED
    static async getSectionsWithFilters(filters = {}) {
        try {
            console.log('🔍 Model: Filtering sections with:', filters);

            let query = `
            SELECT 
                s.section_id,
                s.section_name,
                s.school_level,
                s.grade_level,
                s.strand,
                s.school_year,
                s.max_capacity,
                f.faculty_id as adviser_id,
                f.first_name as adviser_first_name,
                f.last_name as adviser_last_name,
                COUNT(DISTINCT ss.student_id) as enrolled_students
            FROM sections s
            LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
            LEFT JOIN student_sections ss ON s.section_id = ss.section_id 
                AND ss.is_current = 1
            WHERE 1=1
        `;

            const params = [];

            if (filters.school_year && filters.school_year !== '') {
                query += ' AND s.school_year = ?';
                params.push(filters.school_year);
                console.log('  ✓ Filtering by school_year:', filters.school_year);
            }

            if (filters.school_level && filters.school_level !== '') {
                query += ' AND s.school_level = ?';
                params.push(filters.school_level);
                console.log('  ✓ Filtering by school_level:', filters.school_level);
            }

            if (filters.grade_level && filters.grade_level !== '') {
                query += ' AND s.grade_level = ?';
                params.push(filters.grade_level);
                console.log('  ✓ Filtering by grade_level:', filters.grade_level);
            }

            // ✅ is_active filter REMOVED

            query += ' GROUP BY s.section_id ORDER BY s.grade_level, s.section_name';

            console.log('📝 Query:', query);
            console.log('📦 Params:', params);

            const [results] = await db.query(query, params);

            console.log('✅ Model: Found', results.length, 'sections');

            return results;
        } catch (error) {
            console.error('❌ Model Error in getSectionsWithFilters:', error);
            throw error;
        }
    }


    // Get section progression map
    static async getProgressionMap() {
        try {
            const [sections] = await db.query(`
                SELECT s.section_id, s.section_name, s.grade_level, s.next_section_id,
                       ns.section_name as next_section_name, ns.grade_level as next_grade_level
                FROM sections s
                LEFT JOIN sections ns ON s.next_section_id = ns.section_id
                ORDER BY s.grade_level, s.section_name
            `);

            // Group by grade level
            const progressionMap = {};
            sections.forEach(section => {
                const grade = section.grade_level;
                if (!progressionMap[grade]) {
                    progressionMap[grade] = [];
                }
                progressionMap[grade].push(section);
            });

            return progressionMap;
        } catch (error) {
            throw error;
        }
    }

    // Get sections by grade level
    static async getSectionsByGrade(gradeLevel) {
        try {
            const [results] = await db.query(`
                SELECT s.*, 
                       ns.section_name as next_section_name
                FROM sections s
                LEFT JOIN sections ns ON s.next_section_id = ns.section_id
                WHERE s.grade_level = ?
                ORDER BY s.section_name
            `, [gradeLevel]);

            return results;
        } catch (error) {
            throw error;
        }
    }

    // Get single section by ID
    static async getSectionById(sectionId) {
        try {
            const [results] = await db.query(`
                SELECT s.*, 
                       f.first_name as adviser_first_name,
                       f.last_name as adviser_last_name,
                       f.email as adviser_email
                FROM sections s
                LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
                WHERE s.section_id = ?
            `, [sectionId]);

            if (results.length === 0) {
                return null;
            }

            return results[0];
        } catch (error) {
            throw error;
        }
    }

    // Get section with full details (students and subjects)
    static async getSectionWithDetails(sectionId) {
        try {
            // Get section info
            const section = await this.getSectionById(sectionId);

            if (!section) {
                return null;
            }

            // Get enrolled students
            const [students] = await db.query(`
                SELECT 
                    st.*,
                    ss.enrollment_date,
                    ss.enrolled_date
                FROM student_sections ss
                JOIN students st ON ss.student_id = st.student_id
                WHERE ss.section_id = ? AND ss.is_current = 1
                ORDER BY st.last_name, st.first_name
            `, [sectionId]);

            // Get section subjects
            const [subjects] = await db.query(`
                SELECT *
                FROM section_subjects
                WHERE section_id = ? AND is_active = 1
            `, [sectionId]);

            return {
                ...section,
                students,
                subjects
            };
        } catch (error) {
            throw error;
        }
    }

    // Create new section
    static async createSection(sectionData) {
        try {
            const {
                section_name,
                school_level,
                grade_level,
                strand,
                school_year,
                adviser_id,
                max_capacity,
                next_section_id
            } = sectionData;

            const [result] = await db.query(`
                INSERT INTO sections 
                (section_name, school_level, grade_level, strand, school_year, adviser_id, max_capacity, next_section_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                section_name,
                school_level,
                grade_level,
                strand || null,
                school_year,
                adviser_id || null,
                max_capacity || 40,
                next_section_id || null
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update section
    static async updateSection(sectionId, sectionData) {
        try {
            const {
                section_name,
                school_level,
                grade_level,
                strand,
                adviser_id,
                max_capacity,
                is_active,
                next_section_id
            } = sectionData;

            const [result] = await db.query(`
                UPDATE sections 
                SET section_name = ?, 
                    school_level = ?, 
                    grade_level = ?, 
                    strand = ?,
                    adviser_id = ?, 
                    max_capacity = ?,
                    is_active = ?,
                    next_section_id = ?
                WHERE section_id = ?
            `, [
                section_name,
                school_level,
                grade_level,
                strand || null,
                adviser_id || null,
                max_capacity,
                is_active,
                next_section_id || null,
                sectionId
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Patch section (update specific fields)
    static async patchSection(sectionId, updates) {
        try {
            const fields = Object.keys(updates);
            const values = Object.values(updates);

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            const setClause = fields.map(field => `${field} = ?`).join(', ');

            const [result] = await db.query(
                `UPDATE sections SET ${setClause} WHERE section_id = ?`,
                [...values, sectionId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete section
    static async deleteSection(sectionId) {
        try {
            const [result] = await db.query('DELETE FROM sections WHERE section_id = ?', [sectionId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Add student to section
    static async addStudentToSection(sectionId, studentId, schoolYear, enrollmentDate) {
        try {
            // Check if section has capacity
            const [section] = await db.query(`
                SELECT max_capacity, current_capacity FROM sections WHERE section_id = ?
            `, [sectionId]);

            if (section.length === 0) {
                throw new Error('Section not found');
            }

            if (section[0].current_capacity >= section[0].max_capacity) {
                throw new Error('Section is already at maximum capacity');
            }

            // Check if student is already in a section for this school year
            const [existing] = await db.query(`
                SELECT * FROM student_sections 
                WHERE student_id = ? AND school_year = ? AND is_current = 1
            `, [studentId, schoolYear]);

            if (existing.length > 0) {
                throw new Error('Student is already enrolled in a section for this school year');
            }

            // Add student to section
            await db.query(`
                INSERT INTO student_sections (student_id, section_id, school_year, enrolled_date, enrollment_date)
                VALUES (?, ?, ?, ?, ?)
            `, [studentId, sectionId, schoolYear, enrollmentDate, enrollmentDate]);

            // Update section capacity
            await db.query(`
                UPDATE sections 
                SET current_capacity = current_capacity + 1 
                WHERE section_id = ?
            `, [sectionId]);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Remove student from section
    static async removeStudentFromSection(sectionId, studentId) {
        try {
            // Mark as not current
            const [result] = await db.query(`
                UPDATE student_sections 
                SET is_current = 0 
                WHERE section_id = ? AND student_id = ?
            `, [sectionId, studentId]);

            if (result.affectedRows === 0) {
                throw new Error('Student not found in section');
            }

            // Update section capacity
            await db.query(`
                UPDATE sections 
                SET current_capacity = current_capacity - 1 
                WHERE section_id = ?
            `, [sectionId]);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Add subject to section
    static async addSubjectToSection(sectionId, subjectName) {
        try {
            const [result] = await db.query(`
                INSERT INTO section_subjects (section_id, subject_name)
                VALUES (?, ?)
            `, [sectionId, subjectName]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Remove subject from section
    static async removeSubjectFromSection(sectionId, subjectId) {
        try {
            const [result] = await db.query(`
                UPDATE section_subjects 
                SET is_active = 0 
                WHERE section_id = ? AND id = ?
            `, [sectionId, subjectId]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Promote section to next grade
    static async promoteSection(sectionId) {
        try {
            // Get section info
            const [sections] = await db.query(`
                SELECT s.*, ns.section_id as next_section_id, ns.section_name as next_section_name
                FROM sections s
                LEFT JOIN sections ns ON s.next_section_id = ns.section_id
                WHERE s.section_id = ?
            `, [sectionId]);

            if (sections.length === 0) {
                throw new Error('Section not found');
            }

            const section = sections[0];

            if (!section.next_section_id) {
                throw new Error('No next section configured for this section');
            }

            // Get all students in this section
            const [students] = await db.query(`
                SELECT student_id FROM student_sections 
                WHERE section_id = ? AND is_current = 1
            `, [sectionId]);

            if (students.length === 0) {
                throw new Error('No students to promote');
            }

            // Update enrollments to next section
            await db.query(`
                UPDATE student_sections 
                SET section_id = ?, is_current = 1
                WHERE section_id = ? AND is_current = 1
            `, [section.next_section_id, sectionId]);

            return {
                promotedCount: students.length,
                nextSectionName: section.next_section_name
            };
        } catch (error) {
            throw error;
        }
    }

    // Search available students
    static async searchAvailableStudents(filters) {
        try {
            let query = `
                SELECT 
                    s.student_id,
                    s.student_number,
                    s.first_name,
                    s.middle_name,
                    s.last_name,
                    s.suffix,
                    s.school_level,
                    s.current_grade_level,
                    s.strand,
                    s.is_valedictorian,
                    s.is_salutatorian,
                    ss.section_id as current_section_id
                FROM students s
                LEFT JOIN student_sections ss ON s.student_id = ss.student_id 
                    AND ss.is_current = 1 
                    AND ss.school_year = ?
                WHERE s.enrollment_status = 'enrolled'
            `;

            const params = [filters.school_year];

            if (filters.school_level) {
                query += ' AND s.school_level = ?';
                params.push(filters.school_level);
            }

            if (filters.grade_level) {
                query += ' AND s.current_grade_level = ?';
                params.push(filters.grade_level);
            }

            if (filters.exclude_valedictorian === 'true') {
                query += ' AND s.is_valedictorian = 0';
            }

            if (filters.exclude_salutatorian === 'true') {
                query += ' AND s.is_salutatorian = 0';
            }

            if (filters.query) {
                query += ` AND (
                    s.first_name LIKE ? OR 
                    s.last_name LIKE ? OR 
                    s.student_number LIKE ? OR
                    CONCAT(s.first_name, ' ', s.last_name) LIKE ?
                )`;
                const searchTerm = `%${filters.query}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY s.last_name, s.first_name LIMIT 50';

            const [students] = await db.query(query, params);
            return students;
        } catch (error) {
            throw error;
        }
    }

    // Get available faculty
    static async getAvailableFaculty(department = null) {
        try {
            let query = 'SELECT * FROM faculty WHERE is_active = 1';
            const params = [];

            if (department) {
                query += ' AND (department = ? OR department = "Both")';
                params.push(department);
            }

            query += ' ORDER BY last_name, first_name';

            const [faculty] = await db.query(query, params);
            return faculty;
        } catch (error) {
            throw error;
        }
    }

    // Get students in a section
    static async getSectionStudents(sectionId) {
        try {
            console.log('📚 Model: Getting students for section', sectionId);

            const [results] = await db.query(`
            SELECT 
                s.student_id,
                s.student_number,
                s.first_name,
                s.middle_name,
                s.last_name,
                s.is_valedictorian,
                s.is_salutatorian,
                ss.enrolled_date
            FROM student_sections ss
            JOIN students s ON ss.student_id = s.student_id
            WHERE ss.section_id = ? AND ss.is_current = 1
            ORDER BY s.last_name, s.first_name
        `, [sectionId]);

            console.log('✅ Model: Found', results.length, 'students');

            return results;
        } catch (error) {
            console.error('❌ Model: Error getting section students:', error);
            throw error;
        }
    }

    // Add student to section
    static async addStudentToSection(sectionId, studentId, schoolYear, enrollmentDate) {
        try {
            console.log('➕ Model: Adding student to section', { sectionId, studentId });

            // Check if student is already in a section
            const [existing] = await db.query(`
            SELECT * FROM student_sections 
            WHERE student_id = ? AND is_current = 1
        `, [studentId]);

            if (existing.length > 0) {
                throw new Error('Student is already enrolled in another section');
            }

            // Add student to section
            const [result] = await db.query(`
            INSERT INTO student_sections 
            (section_id, student_id, school_year, enrolled_date, is_current) 
            VALUES (?, ?, ?, ?, 1)
        `, [sectionId, studentId, schoolYear, enrollmentDate || new Date()]);

            console.log('✅ Model: Student added to section');

            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Model: Error adding student to section:', error);
            throw error;
        }
    }

    // Remove student from section
    static async removeStudentFromSection(sectionId, studentId) {
        try {
            console.log('➖ Model: Removing student from section', { sectionId, studentId });

            const [result] = await db.query(`
            DELETE FROM student_sections 
            WHERE section_id = ? AND student_id = ? AND is_current = 1
        `, [sectionId, studentId]);

            console.log('✅ Model: Student removed from section');

            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Model: Error removing student from section:', error);
            throw error;
        }
    }

    // Get subjects for a section
static async getSectionSubjects(sectionId) {
    try {
        console.log('📖 Model: Getting subjects for section', sectionId);

        const [results] = await db.query(`
            SELECT 
                id,
                subject_name,
                is_active,
                created_at
            FROM section_subjects
            WHERE section_id = ?
            ORDER BY subject_name
        `, [sectionId]);

        console.log('✅ Model: Found', results.length, 'subjects');

        return results;
    } catch (error) {
        console.error('❌ Model: Error getting section subjects:', error);
        throw error;
    }
}

    // Remove subject from section
    static async removeSubjectFromSection(sectionId, subjectId) {
        try {
            console.log('➖ Model: Removing subject from section', { sectionId, subjectId });

            const [result] = await db.query(`
            DELETE FROM section_subjects 
            WHERE section_id = ? AND subject_id = ?
        `, [sectionId, subjectId]);

            console.log('✅ Model: Subject removed from section');

            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Model: Error removing subject from section:', error);
            throw error;
        }
    }

    // Get available subjects for a section based on curriculum
// Get available subjects for a section based on curriculum
static async getAvailableSubjectsForSection(sectionId) {
    try {
        console.log('📚 Getting available subjects for section:', sectionId);
        
        const [results] = await db.query(`
            SELECT DISTINCT
                s.subject_id,
                s.subject_name,
                s.subject_code,
                cs.semester,
                cs.is_required,
                c.grade_level,
                c.school_level,
                c.strand,
                CASE 
                    WHEN ss.id IS NOT NULL THEN 1 
                    ELSE 0 
                END as already_added
            FROM sections sec
            JOIN curricula c ON 
                sec.school_level = c.school_level 
                AND sec.grade_level = c.grade_level
                AND (sec.strand = c.strand OR c.strand IS NULL OR sec.strand IS NULL)
            JOIN curriculum_subjects cs ON c.curriculum_id = cs.curriculum_id
            JOIN subjects s ON cs.subject_id = s.subject_id
            LEFT JOIN section_subjects ss ON 
                ss.section_id = sec.section_id 
                AND ss.subject_name COLLATE utf8mb4_unicode_ci = s.subject_name COLLATE utf8mb4_unicode_ci
                AND ss.is_active = 1
            WHERE sec.section_id = ?
                AND s.is_active = 1
            ORDER BY 
                cs.is_required DESC,
                s.subject_name ASC
        `, [sectionId]);
        
        console.log('✅ Found', results.length, 'available subjects for this curriculum');
        
        return results;
    } catch (error) {
        console.error('❌ Error getting available subjects:', error);
        throw error;
    }
}

// ============================================
// CURRICULUM MANAGEMENT
// ============================================

// Get available curricula for a section
// Get available curricula for a section
static async getAvailableCurricula(schoolLevel, gradeLevel, strand = null) {
    try {
        console.log('📚 Getting curricula for:', { schoolLevel, gradeLevel, strand });
        
        let query = `
            SELECT 
                curriculum_id,
                curriculum_name,
                school_level,
                grade_level,
                strand,
                is_active,
                (SELECT COUNT(*) 
                 FROM curriculum_subjects 
                 WHERE curriculum_id = curricula.curriculum_id) as subject_count
            FROM curricula
            WHERE school_level = ?
                AND grade_level = ?
                AND is_active = 1
        `;
        
        const params = [schoolLevel, gradeLevel];
        
        if (strand) {
            query += ' AND (strand = ? OR strand IS NULL)';
            params.push(strand);
        } else {
            query += ' AND strand IS NULL';
        }
        
        query += ' ORDER BY curriculum_name ASC';
        
        const [curricula] = await db.query(query, params);
        
        console.log('✅ Found', curricula.length, 'curricula');
        
        return curricula;
    } catch (error) {
        console.error('❌ Error getting curricula:', error);
        throw error;
    }
}

// Assign curriculum to section
// Assign curriculum to section
static async assignCurriculumToSection(sectionId, curriculumId) {
    try {
        console.log('📚 Assigning curriculum', curriculumId, 'to section', sectionId);
        
        // Check if curriculum exists
        const [curriculum] = await db.query(
            'SELECT curriculum_id, curriculum_name FROM curricula WHERE curriculum_id = ?',
            [curriculumId]
        );
        
        if (!curriculum || curriculum.length === 0) {
            throw new Error('Curriculum not found');
        }
        
        console.log('✅ Found curriculum:', curriculum[0].curriculum_name);
        
        // Update section
        const [result] = await db.query(`
            UPDATE sections 
            SET curriculum_id = ? 
            WHERE section_id = ?
        `, [curriculumId, sectionId]);
        
        console.log('✅ Curriculum assigned. Rows affected:', result.affectedRows);
        
        // Verify the update
        const [verification] = await db.query(
            'SELECT curriculum_id FROM sections WHERE section_id = ?',
            [sectionId]
        );
        console.log('🔍 Verification - Section curriculum_id:', verification[0]?.curriculum_id);
        
        return true;
    } catch (error) {
        console.error('❌ Error assigning curriculum:', error);
        throw error;
    }
}

// Get subjects from section's curriculum
static async getSectionSubjectsFromCurriculum(sectionId) {
    try {
        console.log('📚 Getting subjects from curriculum for section:', sectionId);
        
        // First check if section has a curriculum assigned
        const [sectionCheck] = await db.query(`
            SELECT curriculum_id 
            FROM sections 
            WHERE section_id = ?
        `, [sectionId]);
        
        if (!sectionCheck || sectionCheck.length === 0) {
            console.log('❌ Section not found');
            return [];
        }
        
        if (!sectionCheck[0].curriculum_id) {
            console.log('⚠️ No curriculum assigned to this section');
            return [];
        }
        
        console.log('✅ Section has curriculum_id:', sectionCheck[0].curriculum_id);
        
        // Get subjects from curriculum
        const [subjects] = await db.query(`
            SELECT 
                s.subject_id,
                s.subject_name,
                s.subject_code,
                cs.semester,
                cs.is_required,
                c.curriculum_name,
                c.curriculum_id
            FROM sections sec
            JOIN curricula c ON sec.curriculum_id = c.curriculum_id
            JOIN curriculum_subjects cs ON c.curriculum_id = cs.curriculum_id
            JOIN subjects s ON cs.subject_id = s.subject_id
            WHERE sec.section_id = ?
                AND s.is_active = 1
            ORDER BY cs.is_required DESC, s.subject_name ASC
        `, [sectionId]);
        
        console.log('✅ Found', subjects.length, 'subjects from curriculum');
        
        return subjects;
    } catch (error) {
        console.error('❌ Error getting subjects from curriculum:', error);
        throw error;
    }
}

// Get section's current curriculum info
static async getSectionCurriculum(sectionId) {
    try {
        console.log('📚 Getting curriculum for section:', sectionId);
        
        const [result] = await db.query(`
            SELECT 
                c.curriculum_id,
                c.curriculum_name,
                c.school_level,
                c.grade_level,
                c.strand,
                c.school_year,
                (SELECT COUNT(*) 
                 FROM curriculum_subjects 
                 WHERE curriculum_id = c.curriculum_id) as subject_count
            FROM sections sec
            LEFT JOIN curricula c ON sec.curriculum_id = c.curriculum_id
            WHERE sec.section_id = ?
        `, [sectionId]);
        
        return result[0] || null;
    } catch (error) {
        console.error('❌ Error getting section curriculum:', error);
        throw error;
    }
}


}

module.exports = SectionModel;
