const express = require('express');
const router = express.Router();
const successionController = require('../controllers/successionController');

router.get('/preview', successionController.previewPromotion);
router.post('/promote', successionController.promoteStudents);

module.exports = router;
