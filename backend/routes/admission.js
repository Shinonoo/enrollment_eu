const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admissionController = require('../controllers/admissionController');

// ============================================
// SETUP UPLOAD DIRECTORY
// ============================================

const uploadDir = path.join(__dirname, '../../frontend/uploads/student_photos');

// Force create directory with proper permissions
try {
    if (fs.existsSync(uploadDir)) {
        console.log('📂 Upload directory already exists:', uploadDir);
    } else {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
        console.log('✅ Created upload directory:', uploadDir);
    }
    
    // Test if we can write to it
    const testFile = path.join(uploadDir, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Upload directory is writable');
    
} catch (error) {
    console.error('❌ Upload directory error:', error.message);
}

// ============================================
// MULTER CONFIGURATION
// ============================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure directory exists at upload time
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
            } catch (err) {
                console.error('Failed to create directory:', err);
                return cb(err);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'student-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});

// ============================================
// ROUTES
// ============================================

router.post('/submit', (req, res, next) => {
    upload.single('studentPhoto')(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message || 'Failed to upload photo'
            });
        }
        
        if (req.file) {
            req.body.studentPhotoName = req.file.filename;
            req.body.studentPhotoPath = '/uploads/student_photos/' + req.file.filename;
            console.log('✅ Photo saved:', req.file.path);
        } else {
            console.log('⚠️ No photo uploaded');
        }
        
        admissionController.submitAdmission(req, res);
    });
});

router.get('/status/:applicationNumber', admissionController.getAdmissionStatus);
router.get('/pending', admissionController.getPendingAdmissions);
router.get('/:admissionId', admissionController.getAdmissionById);
router.patch('/:admissionId/status', admissionController.updateAdmissionStatus);

module.exports = router;
