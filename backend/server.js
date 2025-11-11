const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');  // ADD THIS
require('dotenv').config();

// Import database connection
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const admissionRoutes = require('./routes/admission');
const studentRoutes = require('./routes/students');
const sectionRoutes = require('./routes/sectionRoutes');
const facultyRoutes = require('./routes/faculty');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const studentStatusRoutes = require('./routes/studentStatus');
const curriculumRoutes = require('./routes/curriculumRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files - ALL OF THEM
app.use(express.static('frontend'));
app.use(express.static('frontend/public'));

// Serve pages, css, and js directories explicitly
app.use('/pages', express.static(path.join(__dirname, 'frontend/pages')));
app.use('/css', express.static(path.join(__dirname, 'frontend/css')));
app.use('/js', express.static(path.join(__dirname, 'frontend/js')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/student-status', studentStatusRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/subjects', subjectsRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/pages/public/index.html'));
});

// Debug: Log all registered payment routes
console.log('\n📋 Registered Payment Routes:');
paymentRoutes.stack.forEach(layer => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`  ${methods} /api/payments${layer.route.path}`);
    }
});
console.log('');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Enrollment System API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log('========================================\n');
});

module.exports = app;
