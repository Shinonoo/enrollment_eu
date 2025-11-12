const SectionModel = require('../models/sectionModel');

// Get all sections with filtering
// Get all sections with filtering - STATUS REMOVED
exports.getAllSections = async (req, res) => {
    try {
        console.log('📥 Request query params:', req.query);
        
        const filters = {
            school_year: req.query.school_year || '',
            school_level: req.query.school_level || '',
            grade_level: req.query.grade_level || ''
            // ✅ is_active REMOVED
        };
        
        console.log('🔍 Controller: Applying filters:', filters);
        
        const sections = await SectionModel.getSectionsWithFilters(filters);
        
        console.log('✅ Controller: Returning', sections.length, 'sections');
        
        res.json({
            success: true,
            sections: sections || [],
            filters: filters
        });
    } catch (error) {
        console.error('❌ Error fetching sections:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sections',
            error: error.message
        });
    }
};

// Get section progression map
exports.getProgressionMap = async (req, res) => {
    try {
        const progressionMap = await SectionModel.getProgressionMap();
        
        res.json({
            success: true,
            progressionMap: progressionMap || {}
        });
    } catch (error) {
        console.error('❌ Error fetching progression map:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progression map',
            error: error.message
        });
    }
};

// Get sections by grade level
exports.getSectionsByGrade = async (req, res) => {
    try {
        const { gradeLevel } = req.params;
        
        if (!gradeLevel) {
            return res.status(400).json({
                success: false,
                message: 'Grade level is required'
            });
        }
        
        const sections = await SectionModel.getSectionsByGrade(gradeLevel);
        
        res.json({
            success: true,
            sections: sections || []
        });
    } catch (error) {
        console.error('❌ Error fetching sections by grade:', error);
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
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const section = await SectionModel.getSectionWithDetails(sectionId);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        res.json({
            success: true,
            section
        });
    } catch (error) {
        console.error('❌ Error fetching section details:', error);
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
        const { section_name, school_level, grade_level, school_year } = req.body;
        
        // Validation
        if (!section_name || !school_level || !grade_level || !school_year) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: section_name, school_level, grade_level, school_year'
            });
        }
        
        const sectionId = await SectionModel.createSection(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            section_id: sectionId
        });
    } catch (error) {
        console.error('❌ Error creating section:', error);
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
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const updated = await SectionModel.updateSection(sectionId, req.body);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Section updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating section:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating section',
            error: error.message
        });
    }
};

// Patch section (partial update)
exports.patchSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        const updated = await SectionModel.patchSection(sectionId, req.body);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Section updated successfully'
        });
    } catch (error) {
        console.error('❌ Error patching section:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating section',
            error: error.message
        });
    }
};

// Delete section
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const deleted = await SectionModel.deleteSection(sectionId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting section:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting section',
            error: error.message
        });
    }
};

// Add student to section
exports.addStudentToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { student_id, school_year, enrollment_date } = req.body;
        
        // Validation
        if (!sectionId || !student_id || !school_year) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sectionId, student_id, school_year'
            });
        }
        
        await SectionModel.addStudentToSection(
            sectionId, 
            student_id, 
            school_year, 
            enrollment_date || new Date().toISOString().split('T')[0]
        );
        
        res.json({
            success: true,
            message: 'Student added to section successfully'
        });
    } catch (error) {
        console.error('❌ Error adding student to section:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error adding student to section'
        });
    }
};

// Remove student from section
exports.removeStudentFromSection = async (req, res) => {
    try {
        const { sectionId, studentId } = req.params;
        
        if (!sectionId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Student ID are required'
            });
        }
        
        await SectionModel.removeStudentFromSection(sectionId, studentId);
        
        res.json({
            success: true,
            message: 'Student removed from section successfully'
        });
    } catch (error) {
        console.error('❌ Error removing student from section:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error removing student from section'
        });
    }
};

// Add subject to section
exports.addSubjectToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { subject_name } = req.body;
        
        if (!sectionId || !subject_name) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and subject name are required'
            });
        }
        
        await SectionModel.addSubjectToSection(sectionId, subject_name);
        
        res.json({
            success: true,
            message: 'Subject added to section successfully'
        });
    } catch (error) {
        console.error('❌ Error adding subject to section:', error);
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
        
        if (!sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Subject ID are required'
            });
        }
        
        await SectionModel.removeSubjectFromSection(sectionId, subjectId);
        
        res.json({
            success: true,
            message: 'Subject removed from section successfully'
        });
    } catch (error) {
        console.error('❌ Error removing subject from section:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing subject from section',
            error: error.message
        });
    }
};

// Promote section
exports.promoteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const result = await SectionModel.promoteSection(sectionId);
        
        res.json({
            success: true,
            message: `${result.promotedCount} students promoted to ${result.nextSectionName}`,
            promoted_count: result.promotedCount
        });
    } catch (error) {
        console.error('❌ Error promoting section:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error promoting section'
        });
    }
};

// Search available students
exports.searchAvailableStudents = async (req, res) => {
    try {
        const filters = {
            query: req.query.query || '',
            school_year: req.query.school_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            school_level: req.query.school_level || '',
            grade_level: req.query.grade_level || '',
            exclude_valedictorian: req.query.exclude_valedictorian || 'false',
            exclude_salutatorian: req.query.exclude_salutatorian || 'false'
        };
        
        const students = await SectionModel.searchAvailableStudents(filters);
        
        res.json({
            success: true,
            students: students || []
        });
    } catch (error) {
        console.error('❌ Error searching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching students',
            error: error.message
        });
    }
};

// Get available faculty
exports.getAvailableFaculty = async (req, res) => {
    try {
        const { department } = req.query;
        const faculty = await SectionModel.getAvailableFaculty(department);
        
        res.json({
            success: true,
            faculty: faculty || []
        });
    } catch (error) {
        console.error('❌ Error fetching faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching faculty',
            error: error.message
        });
    }
};

// Assign faculty to section
exports.assignFacultyToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { faculty_id } = req.body;
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        await SectionModel.patchSection(sectionId, { adviser_id: faculty_id || null });
        
        res.json({
            success: true,
            message: faculty_id ? 'Faculty assigned as adviser successfully' : 'Adviser removed successfully'
        });
    } catch (error) {
        console.error('❌ Error assigning faculty:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning faculty',
            error: error.message
        });
    }
};

// Delete section
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const deleted = await SectionModel.deleteSection(sectionId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting section:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting section',
            error: error.message
        });
    }
};

// Get students in a section
exports.getSectionStudents = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        console.log('📚 Getting students for section:', sectionId);
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const students = await SectionModel.getSectionStudents(sectionId);
        
        console.log('✅ Found', students.length, 'students');
        
        res.json({
            success: true,
            students: students || []
        });
    } catch (error) {
        console.error('❌ Error getting section students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Add student to section
exports.addStudentToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { student_id, school_year, enrollment_date } = req.body;
        
        console.log('➕ Adding student to section:', { sectionId, student_id });
        
        if (!sectionId || !student_id) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Student ID are required'
            });
        }
        
        const added = await SectionModel.addStudentToSection(sectionId, student_id, school_year, enrollment_date);
        
        if (!added) {
            return res.status(400).json({
                success: false,
                message: 'Failed to add student to section'
            });
        }
        
        res.json({
            success: true,
            message: 'Student added to section successfully'
        });
    } catch (error) {
        console.error('❌ Error adding student to section:', error);
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
        
        console.log('➖ Removing student from section:', { sectionId, studentId });
        
        if (!sectionId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Student ID are required'
            });
        }
        
        const removed = await SectionModel.removeStudentFromSection(sectionId, studentId);
        
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Student not found in section'
            });
        }
        
        res.json({
            success: true,
            message: 'Student removed from section successfully'
        });
    } catch (error) {
        console.error('❌ Error removing student from section:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing student from section',
            error: error.message
        });
    }
};

// Get subjects for a section
exports.getSectionSubjects = async (req, res) => {
    try {
        console.log('🔍 Step 1: Function called');
        const { sectionId } = req.params;
        console.log('🔍 Step 2: Section ID:', sectionId);
        
        const subjects = await SectionModel.getSectionSubjects(sectionId);
        console.log('🔍 Step 3: Subjects retrieved:', subjects);
        
        res.json({
            success: true,
            subjects: subjects || []
        });
    } catch (error) {
        console.error('❌ FULL ERROR:', error); // Log full error object
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
};


// Add subject to section
exports.addSubjectToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { subject_name } = req.body;
        
        console.log('➕ Adding subject to section:', { sectionId, subject_name });
        
        if (!sectionId || !subject_name) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Subject Name are required'
            });
        }
        
        const added = await SectionModel.addSubjectToSection(sectionId, subject_name);
        
        if (!added) {
            return res.status(400).json({
                success: false,
                message: 'Failed to add subject to section'
            });
        }
        
        res.json({
            success: true,
            message: 'Subject added to section successfully'
        });
    } catch (error) {
        console.error('❌ Error adding subject to section:', error);
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
        
        console.log('➖ Removing subject from section:', { sectionId, subjectId });
        
        if (!sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Subject ID are required'
            });
        }
        
        const removed = await SectionModel.removeSubjectFromSection(sectionId, subjectId);
        
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found in section'
            });
        }
        
        res.json({
            success: true,
            message: 'Subject removed from section successfully'
        });
    } catch (error) {
        console.error('❌ Error removing subject from section:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing subject from section',
            error: error.message
        });
    }
};

// Get available subjects for adding to section
exports.getAvailableSubjects = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        console.log('📚 Getting available subjects for section:', sectionId);
        
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }
        
        const subjects = await SectionModel.getAvailableSubjectsForSection(sectionId);
        
        res.json({
            success: true,
            subjects: subjects || []
        });
    } catch (error) {
        console.error('❌ Error getting available subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available subjects',
            error: error.message
        });
    }
};

// ============================================
// CURRICULUM MANAGEMENT
// ============================================

// Get available curricula for section
exports.getAvailableCurricula = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        console.log('📚 Getting available curricula for section:', sectionId);
        
        // Get section details first
        const section = await SectionModel.getSectionWithDetails(sectionId);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }
        
        const curricula = await SectionModel.getAvailableCurricula(
            section.school_level,
            section.grade_level,
            section.strand
        );
        
        res.json({
            success: true,
            curricula: curricula || [],
            current_curriculum_id: section.curriculum_id
        });
    } catch (error) {
        console.error('❌ Error getting available curricula:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching curricula',
            error: error.message
        });
    }
};

// Assign curriculum to section
exports.assignCurriculum = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { curriculum_id } = req.body;
        
        console.log('📚 Assigning curriculum to section:', { sectionId, curriculum_id });
        
        if (!curriculum_id) {
            return res.status(400).json({
                success: false,
                message: 'Curriculum ID is required'
            });
        }
        
        await SectionModel.assignCurriculumToSection(sectionId, curriculum_id);
        
        res.json({
            success: true,
            message: 'Curriculum assigned successfully'
        });
    } catch (error) {
        console.error('❌ Error assigning curriculum:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning curriculum',
            error: error.message
        });
    }
};

// Get subjects from section's curriculum
exports.getSectionCurriculumSubjects = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        console.log('📚 Getting curriculum subjects for section:', sectionId);
        
        const subjects = await SectionModel.getSectionSubjectsFromCurriculum(sectionId);
        
        res.json({
            success: true,
            subjects: subjects || []
        });
    } catch (error) {
        console.error('❌ Error getting curriculum subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching curriculum subjects',
            error: error.message
        });
    }
};

// Get section's current curriculum info
exports.getSectionCurriculum = async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        console.log('📚 Getting section curriculum:', sectionId);
        
        const curriculum = await SectionModel.getSectionCurriculum(sectionId);
        
        res.json({
            success: true,
            curriculum: curriculum
        });
    } catch (error) {
        console.error('❌ Error getting section curriculum:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching section curriculum',
            error: error.message
        });
    }
};



// At the end of sections.js, before module.exports:
console.log('✅ Section routes loaded:');
console.log('  GET    /api/sections');
console.log('  GET    /api/sections/:id');
console.log('  POST   /api/sections');
console.log('  PUT    /api/sections/:id');
console.log('  DELETE /api/sections/:id');
console.log('  GET    /api/sections/:id/students');
console.log('  POST   /api/sections/:id/students');
console.log('  DELETE /api/sections/:id/students/:studentId');
console.log('  GET    /api/sections/:id/subjects');
console.log('  POST   /api/sections/:id/subjects');
console.log('  DELETE /api/sections/:id/subjects/:subjectId');

module.exports;