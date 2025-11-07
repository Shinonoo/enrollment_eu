const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');

// Curriculum routes
router.get('/', curriculumController.getAllCurricula);
router.get('/create', curriculumController.getCreatePage);
router.post('/create', curriculumController.createCurriculum);
router.get('/:curriculum_id', curriculumController.getCurriculumDetail);
router.get('/:curriculum_id/edit', curriculumController.getEditPage);
router.post('/:curriculum_id/update', curriculumController.updateCurriculum);
router.post('/:curriculum_id/delete', curriculumController.deleteCurriculum);
router.post('/:curriculum_id/toggle-status', curriculumController.toggleStatus);

// Curriculum subjects routes
router.post('/:curriculum_id/add-subject', curriculumController.addSubjectToCurriculum);
router.post('/:curriculum_id/remove-subject/:subject_id', curriculumController.removeSubjectFromCurriculum);

module.exports = router;
