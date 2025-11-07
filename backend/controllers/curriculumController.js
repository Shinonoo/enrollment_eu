const db = require('../config/database');

// Get all curricula with subject count
exports.getAllCurricula = (req, res) => {
  const query = `
    SELECT 
      c.*,
      COUNT(cs.curriculum_subject_id) as subject_count
    FROM curricula c
    LEFT JOIN curriculum_subjects cs ON c.curriculum_id = cs.curriculum_id
    GROUP BY c.curriculum_id
    ORDER BY c.school_level, c.grade_level, c.curriculum_name
  `;
  
  db.query(query, (err, curricula) => {
    if (err) return res.status(500).send(err);
    res.render('curriculum/index', { curricula });
  });
};

// Get create page
exports.getCreatePage = (req, res) => {
  const query = `SELECT * FROM subjects WHERE is_active = 1 ORDER BY school_level, grade_level, subject_name`;
  
  db.query(query, (err, subjects) => {
    if (err) return res.status(500).send(err);
    res.render('curriculum/create', { subjects });
  });
};

// Create curriculum
exports.createCurriculum = (req, res) => {
  const { curriculum_code, curriculum_name, school_level, grade_level, strand, description, subjects } = req.body;
  
  const curriculumQuery = `
    INSERT INTO curricula (curriculum_code, curriculum_name, school_level, grade_level, strand, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(curriculumQuery, [curriculum_code, curriculum_name, school_level, grade_level, strand || null, description], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).render('curriculum/create', { error: 'Curriculum code already exists', subjects: [] });
      }
      return res.status(500).send(err);
    }
    
    const curriculum_id = result.insertId;
    
    // Add subjects if provided
    if (subjects && subjects.length > 0) {
      const subjectInserts = subjects.map(subject_id => [curriculum_id, subject_id, 'Both', 1]);
      const insertSubjectsQuery = `INSERT INTO curriculum_subjects (curriculum_id, subject_id, semester, is_required) VALUES ?`;
      
      db.query(insertSubjectsQuery, [subjectInserts], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/curriculum');
      });
    } else {
      res.redirect('/curriculum');
    }
  });
};

// Get curriculum detail
exports.getCurriculumDetail = (req, res) => {
  const { curriculum_id } = req.params;
  
  const curriculumQuery = `SELECT * FROM curricula WHERE curriculum_id = ?`;
  const subjectsQuery = `
    SELECT 
      cs.*,
      s.subject_code,
      s.subject_name,
      s.units
    FROM curriculum_subjects cs
    JOIN subjects s ON cs.subject_id = s.subject_id
    WHERE cs.curriculum_id = ?
    ORDER BY s.subject_name
  `;
  
  db.query(curriculumQuery, [curriculum_id], (err, curriculum) => {
    if (err) return res.status(500).send(err);
    if (curriculum.length === 0) return res.status(404).send('Curriculum not found');
    
    db.query(subjectsQuery, [curriculum_id], (err, subjects) => {
      if (err) return res.status(500).send(err);
      res.render('curriculum/detail', { curriculum: curriculum[0], subjects });
    });
  });
};

// Get edit page
exports.getEditPage = (req, res) => {
  const { curriculum_id } = req.params;
  
  const curriculumQuery = `SELECT * FROM curricula WHERE curriculum_id = ?`;
  const assignedSubjectsQuery = `
    SELECT subject_id FROM curriculum_subjects WHERE curriculum_id = ?
  `;
  const allSubjectsQuery = `SELECT * FROM subjects WHERE is_active = 1 ORDER BY school_level, grade_level, subject_name`;
  
  db.query(curriculumQuery, [curriculum_id], (err, curriculum) => {
    if (err) return res.status(500).send(err);
    if (curriculum.length === 0) return res.status(404).send('Curriculum not found');
    
    db.query(assignedSubjectsQuery, [curriculum_id], (err, assigned) => {
      if (err) return res.status(500).send(err);
      
      db.query(allSubjectsQuery, (err, subjects) => {
        if (err) return res.status(500).send(err);
        
        const assignedIds = assigned.map(a => a.subject_id);
        res.render('curriculum/edit', { 
          curriculum: curriculum[0], 
          subjects, 
          assignedIds 
        });
      });
    });
  });
};

// Update curriculum
exports.updateCurriculum = (req, res) => {
  const { curriculum_id } = req.params;
  const { curriculum_code, curriculum_name, school_level, grade_level, strand, description } = req.body;
  
  const query = `
    UPDATE curricula 
    SET curriculum_code = ?, curriculum_name = ?, school_level = ?, 
        grade_level = ?, strand = ?, description = ?
    WHERE curriculum_id = ?
  `;
  
  db.query(query, [curriculum_code, curriculum_name, school_level, grade_level, strand || null, description, curriculum_id], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send('Curriculum code already exists');
      }
      return res.status(500).send(err);
    }
    res.redirect(`/curriculum/${curriculum_id}`);
  });
};

// Delete curriculum
exports.deleteCurriculum = (req, res) => {
  const { curriculum_id } = req.params;
  
  const query = `DELETE FROM curricula WHERE curriculum_id = ?`;
  
  db.query(query, [curriculum_id], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/curriculum');
  });
};

// Toggle active status
exports.toggleStatus = (req, res) => {
  const { curriculum_id } = req.params;
  
  const query = `UPDATE curricula SET is_active = NOT is_active WHERE curriculum_id = ?`;
  
  db.query(query, [curriculum_id], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/curriculum');
  });
};

// Add subject to curriculum
exports.addSubjectToCurriculum = (req, res) => {
  const { curriculum_id } = req.params;
  const { subject_id, semester, is_required } = req.body;
  
  const query = `
    INSERT INTO curriculum_subjects (curriculum_id, subject_id, semester, is_required)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [curriculum_id, subject_id, semester || 'Both', is_required || 1], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Subject already in curriculum' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
};

// Remove subject from curriculum
exports.removeSubjectFromCurriculum = (req, res) => {
  const { curriculum_id, subject_id } = req.params;
  
  const query = `DELETE FROM curriculum_subjects WHERE curriculum_id = ? AND subject_id = ?`;
  
  db.query(query, [curriculum_id, subject_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};
