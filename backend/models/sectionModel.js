const db = require('../config/database');

const SectionModel = {
  // Get all sections with optional filters
  getAllSections: async (filters = {}) => {
    let query = `
      SELECT 
        s.*,
        CONCAT(f.first_name, ' ', f.last_name) as adviser_name,
        (SELECT COUNT(*) FROM student_sections ss 
         WHERE ss.section_id = s.section_id AND ss.is_current = 1) as enrolled_count
      FROM sections s
      LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.school_year) {
      query += ' AND s.school_year = ?';
      params.push(filters.school_year);
    }
    
    if (filters.school_level) {
      query += ' AND s.school_level = ?';
      params.push(filters.school_level);
    }
    
    if (filters.grade_level) {
      query += ' AND s.grade_level = ?';
      params.push(filters.grade_level);
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(filters.is_active);
    }
    
    query += ' ORDER BY s.school_level, s.grade_level, s.section_name';
    
    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get section by ID
  getSectionById: async (sectionId) => {
    const query = `
      SELECT 
        s.*,
        CONCAT(f.first_name, ' ', f.last_name) as adviser_name,
        f.employee_number,
        (SELECT COUNT(*) FROM student_sections ss 
         WHERE ss.section_id = s.section_id AND ss.is_current = 1) as enrolled_count
      FROM sections s
      LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
      WHERE s.section_id = ?
    `;
    
    const [rows] = await db.query(query, [sectionId]);
    return rows[0];
  },

  // Create new section
  createSection: async (sectionData) => {
    const query = `
      INSERT INTO sections (
        section_name, school_level, grade_level, strand, 
        school_year, adviser_id, max_capacity, next_section_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      sectionData.section_name,
      sectionData.school_level,
      sectionData.grade_level,
      sectionData.strand || null,
      sectionData.school_year,
      sectionData.adviser_id || null,
      sectionData.max_capacity || 40,
      sectionData.next_section_id || null
    ]);
    
    return result.insertId;
  },

  // Update section
  updateSection: async (sectionId, sectionData) => {
    const query = `
      UPDATE sections 
      SET section_name = ?, 
          school_level = ?, 
          grade_level = ?, 
          strand = ?,
          school_year = ?,
          adviser_id = ?,
          max_capacity = ?,
          next_section_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE section_id = ?
    `;
    
    const [result] = await db.query(query, [
      sectionData.section_name,
      sectionData.school_level,
      sectionData.grade_level,
      sectionData.strand || null,
      sectionData.school_year,
      sectionData.adviser_id || null,
      sectionData.max_capacity,
      sectionData.next_section_id || null,
      sectionId
    ]);
    
    return result.affectedRows > 0;
  },

  // Toggle section active status
  toggleSectionStatus: async (sectionId, isActive) => {
    const query = 'UPDATE sections SET is_active = ? WHERE section_id = ?';
    const [result] = await db.query(query, [isActive, sectionId]);
    return result.affectedRows > 0;
  },

  // Delete section (only if no students enrolled)
  deleteSection: async (sectionId) => {
    // Check if section has students
    const [students] = await db.query(
      'SELECT COUNT(*) as count FROM student_sections WHERE section_id = ?',
      [sectionId]
    );
    
    if (students[0].count > 0) {
      throw new Error('Cannot delete section with enrolled students');
    }
    
    const [result] = await db.query('DELETE FROM sections WHERE section_id = ?', [sectionId]);
    return result.affectedRows > 0;
  },

  // Get available advisers
  getAvailableAdvisers: async () => {
    const query = `
      SELECT 
        f.faculty_id,
        CONCAT(f.first_name, ' ', f.last_name) as full_name,
        f.employee_number,
        f.department,
        COUNT(s.section_id) as section_count
      FROM faculty f
      LEFT JOIN sections s ON f.faculty_id = s.adviser_id AND s.is_active = 1
      WHERE f.is_active = 1
      GROUP BY f.faculty_id
      ORDER BY section_count ASC, f.last_name
    `;
    
    const [rows] = await db.query(query);
    return rows;
  },

  // Get section subjects
  getSectionSubjects: async (sectionId) => {
    const query = `
      SELECT * FROM section_subjects 
      WHERE section_id = ? AND is_active = 1
      ORDER BY subject_name
    `;
    
    const [rows] = await db.query(query, [sectionId]);
    return rows;
  },

  // Check section name uniqueness
  checkSectionNameExists: async (sectionName, schoolYear, excludeId = null) => {
    let query = 'SELECT section_id FROM sections WHERE section_name = ? AND school_year = ?';
    const params = [sectionName, schoolYear];
    
    if (excludeId) {
      query += ' AND section_id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.query(query, params);
    return rows.length > 0;
  },

  // Add a student to a section
  addStudentToSection: async (studentId, sectionId, schoolYear) => {
    const query = `
      INSERT INTO student_sections (student_id, section_id, school_year, enrolled_date, is_current)
      VALUES (?, ?, ?, CURDATE(), 1)
    `;
    await db.query(query, [studentId, sectionId, schoolYear]);
  },

  // Get students in a section with filters
  getSectionStudents: async (sectionId, filters = {}) => {
    let query = `
      SELECT 
        st.student_id, st.first_name, st.last_name, st.current_grade_level, st.is_valedictorian, st.is_salutatorian
      FROM students st
      JOIN student_sections ss ON st.student_id = ss.student_id
      WHERE ss.section_id = ? AND ss.is_current = 1
    `;
    const params = [sectionId];
    if (filters.grade_level) {
      query += ' AND st.current_grade_level = ?';
      params.push(filters.grade_level);
    }
    if (filters.honor_roll) {
      query += ' AND (st.is_valedictorian = 1 OR st.is_salutatorian = 1)';
    }
    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = SectionModel;
