const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');

// Get all curricula
router.get('/', curriculumController.getAllCurricula);

// Create new curriculum
router.post('/create', curriculumController.createCurriculum);

// Get curriculum details WITH subjects (this is what you need to fix)
router.get('/:curriculum_id', curriculumController.getCurriculumDetail);

// Update curriculum
router.put('/:curriculum_id', curriculumController.updateCurriculum);
// OR if you prefer POST:
router.post('/:curriculum_id/update', curriculumController.updateCurriculum);

// Delete curriculum
router.delete('/:curriculum_id', curriculumController.deleteCurriculum);
// OR if you prefer POST:
router.post('/:curriculumid/delete', curriculumController.deleteCurriculum);
// Toggle curriculum status
router.patch('/:curriculum_id/status', curriculumController.toggleStatus);
// OR if you prefer POST:
router.post('/:curriculum_id/toggle-status', curriculumController.toggleStatus);

// Add subject to curriculum
router.post('/:curriculum_id/subjects', curriculumController.addSubjectToCurriculum);
// OR keep your version:
router.post('/:curriculum_id/add-subject', curriculumController.addSubjectToCurriculum);

// Remove subject from curriculum
router.delete('/:curriculum_id/subjects/:subject_id', curriculumController.removeSubjectFromCurriculum);
// OR keep your version:
router.post('/:curriculum_id/remove-subject/:subject_id', curriculumController.removeSubjectFromCurriculum);

module.exports = router;
