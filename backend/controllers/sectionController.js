const db = require('../config/database');

// Get all sections with filtering
exports.getAllSections = async (req, res) => {
  try {
    const { school_year, school_level, grade_level, is_active } = req.query;
    
    let query = `
      SELECT 
        s.*,
        f.first_name as adviser_first_name,
        f.last_name as adviser_last_name,
        COUNT(DISTINCT ss.student_id) as enrolled_students
      FROM sections s
      LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
      LEFT JOIN student_sections ss ON s.section_id = ss.section_id AND ss.is_current = 1
      WHERE 1=1
    `;
    
    const params = [];
    
    if (school_year) {
      query += ' AND s.school_year = ?';
      params.push(school_year);
    }
    
    if (school_level) {
      query += ' AND s.school_level = ?';
      params.push(school_level);
    }
    
    if (grade_level) {
      query += ' AND s.grade_level = ?';
      params.push(grade_level);
    }
    
    if (is_active !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(is_active);
    }
    
    query += ' GROUP BY s.section_id ORDER BY s.grade_level, s.section_name';
    
    const [sections] = await db.query(query, params);
    
    res.json({
      success: true,
      sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sections',
      error: error.message
    });
  }
};

// Get single section with details
exports.getSectionDetails = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    // Get section info
    const [sections] = await db.query(`
      SELECT 
        s.*,
        f.first_name as adviser_first_name,
        f.last_name as adviser_last_name,
        f.email as adviser_email
      FROM sections s
      LEFT JOIN faculty f ON s.adviser_id = f.faculty_id
      WHERE s.section_id = ?
    `, [sectionId]);
    
    if (sections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    const section = sections[0];
    
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
    
    res.json({
      success: true,
      section: {
        ...section,
        students,
        subjects
      }
    });
  } catch (error) {
    console.error('Error fetching section details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching section details',
      error: error.message
    });
  }
};

// Create new section
exports.createSection = async (req, res) => {
  try {
    const { 
      section_name, 
      school_level, 
      grade_level, 
      strand,
      school_year, 
      adviser_id, 
      max_capacity 
    } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO sections 
      (section_name, school_level, grade_level, strand, school_year, adviser_id, max_capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [section_name, school_level, grade_level, strand || null, school_year, adviser_id || null, max_capacity || 40]);
    
    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      section_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating section',
      error: error.message
    });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { 
      section_name, 
      school_level, 
      grade_level, 
      strand,
      adviser_id, 
      max_capacity,
      is_active
    } = req.body;
    
    await db.query(`
      UPDATE sections 
      SET section_name = ?, 
          school_level = ?, 
          grade_level = ?, 
          strand = ?,
          adviser_id = ?, 
          max_capacity = ?,
          is_active = ?
      WHERE section_id = ?
    `, [section_name, school_level, grade_level, strand || null, adviser_id || null, max_capacity, is_active, sectionId]);
    
    res.json({
      success: true,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating section',
      error: error.message
    });
  }
};

// Add student to section
exports.addStudentToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { student_id, school_year, enrollment_date } = req.body;
    
    // Check if section has capacity
    const [section] = await db.query(`
      SELECT max_capacity, current_capacity FROM sections WHERE section_id = ?
    `, [sectionId]);
    
    if (section.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    if (section[0].current_capacity >= section[0].max_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Section is already at maximum capacity'
      });
    }
    
    // Check if student is already in a section for this school year
    const [existing] = await db.query(`
      SELECT * FROM student_sections 
      WHERE student_id = ? AND school_year = ? AND is_current = 1
    `, [student_id, school_year]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in a section for this school year'
      });
    }
    
    // Add student to section
    await db.query(`
      INSERT INTO student_sections (student_id, section_id, school_year, enrolled_date, enrollment_date)
      VALUES (?, ?, ?, ?, ?)
    `, [student_id, sectionId, school_year, enrollment_date || new Date(), enrollment_date || new Date()]);
    
    // Update section capacity
    await db.query(`
      UPDATE sections 
      SET current_capacity = current_capacity + 1 
      WHERE section_id = ?
    `, [sectionId]);
    
    res.json({
      success: true,
      message: 'Student added to section successfully'
    });
  } catch (error) {
    console.error('Error adding student to section:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding student to section',
      error: error.message
    });
  }
};

// Remove student from section
exports.removeStudentFromSection = async (req, res) => {
  try {
    const { sectionId, studentId } = req.params;
    
    // Mark as not current
    await db.query(`
      UPDATE student_sections 
      SET is_current = 0 
      WHERE section_id = ? AND student_id = ?
    `, [sectionId, studentId]);
    
    // Update section capacity
    await db.query(`
      UPDATE sections 
      SET current_capacity = current_capacity - 1 
      WHERE section_id = ?
    `, [sectionId]);
    
    res.json({
      success: true,
      message: 'Student removed from section successfully'
    });
  } catch (error) {
    console.error('Error removing student from section:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing student from section',
      error: error.message
    });
  }
};

// Add subject to section
exports.addSubjectToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { subject_name } = req.body;
    
    await db.query(`
      INSERT INTO section_subjects (section_id, subject_name)
      VALUES (?, ?)
    `, [sectionId, subject_name]);
    
    res.json({
      success: true,
      message: 'Subject added to section successfully'
    });
  } catch (error) {
    console.error('Error adding subject to section:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding subject to section',
      error: error.message
    });
  }
};

// Remove subject from section
exports.removeSubjectFromSection = async (req, res) => {
  try {
    const { sectionId, subjectId } = req.params;
    
    await db.query(`
      UPDATE section_subjects 
      SET is_active = 0 
      WHERE section_id = ? AND id = ?
    `, [sectionId, subjectId]);
    
    res.json({
      success: true,
      message: 'Subject removed from section successfully'
    });
  } catch (error) {
    console.error('Error removing subject from section:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing subject from section',
      error: error.message
    });
  }
};

// Search available students
exports.searchAvailableStudents = async (req, res) => {
  try {
    const { query, school_year, school_level, grade_level, exclude_valedictorian, exclude_salutatorian } = req.query;
    
    let sql = `
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
    
    const params = [school_year];
    
    if (school_level) {
      sql += ' AND s.school_level = ?';
      params.push(school_level);
    }
    
    if (grade_level) {
      sql += ' AND s.current_grade_level = ?';
      params.push(grade_level);
    }
    
    if (exclude_valedictorian === 'true') {
      sql += ' AND s.is_valedictorian = 0';
    }
    
    if (exclude_salutatorian === 'true') {
      sql += ' AND s.is_salutatorian = 0';
    }
    
    if (query) {
      sql += ` AND (
        s.first_name LIKE ? OR 
        s.last_name LIKE ? OR 
        s.student_number LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ?
      )`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY s.last_name, s.first_name LIMIT 50';
    
    const [students] = await db.query(sql, params);
    
    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching students',
      error: error.message
    });
  }
};

// Assign faculty to section
exports.assignFacultyToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { faculty_id } = req.body;
    
    await db.query(`
      UPDATE sections 
      SET adviser_id = ? 
      WHERE section_id = ?
    `, [faculty_id, sectionId]);
    
    res.json({
      success: true,
      message: 'Faculty assigned as adviser successfully'
    });
  } catch (error) {
    console.error('Error assigning faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning faculty',
      error: error.message
    });
  }
};

// Get available faculty
exports.getAvailableFaculty = async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = 'SELECT * FROM faculty WHERE is_active = 1';
    const params = [];
    
    if (department) {
      query += ' AND (department = ? OR department = "Both")';
      params.push(department);
    }
    
    query += ' ORDER BY last_name, first_name';
    
    const [faculty] = await db.query(query, params);
    
    res.json({
      success: true,
      faculty
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message
    });
  }
};
