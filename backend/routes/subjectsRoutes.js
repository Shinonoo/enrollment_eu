const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');

router.get('/', subjectsController.getAllSubjects);
router.get('/by-level', subjectsController.getSubjectsByLevel);


module.exports = router;
