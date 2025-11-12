const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database connection
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const admissionRoutes = require('./routes/admission');
const studentRoutes = require('./routes/students');
const sectionRoutes = require('./routes/sections'); // ⚠️ FIXED: was 'sectionRoutes'
const facultyRoutes = require('./routes/faculty');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const studentStatusRoutes = require('./routes/studentStatus');
const curriculumRoutes = require('./routes/curriculumRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const successionRoutes = require('./routes/successionRoutes');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE (Order matters!)
// ============================================

// 1. CORS - Must be first
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // ⚠️ FIXED: Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body parsers
app.use(express.json({ limit: '50mb' })); // ✅ IMPROVED: Using express.json instead of body-parser
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Request logging (helpful for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// STATIC FILES (Order matters!)
// ============================================

// Serve static files with correct paths relative to server.js location
const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/pages', express.static(path.join(frontendPath, 'pages')));
app.use('/assets', express.static(path.join(frontendPath, 'assets'))); // ✅ ADDED: For images, etc.

// ============================================
// API ROUTES (Before catch-all routes)
// ============================================

app.use('/api/sections/succession', successionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sections', sectionRoutes); // ⚠️ FIXED: Consistent naming
app.use('/api/faculty', facultyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/student-status', studentStatusRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/subjects', subjectsRoutes);

// ============================================
// UTILITY ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK', 
        message: 'Enrollment System API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ 
            success: true,
            status: 'OK', 
            message: 'Database connection is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            status: 'ERROR', 
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/public/index.html'));
});

// ============================================
// DEBUG: Log all registered routes (development only)
// ============================================

if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Registered API Routes:');
    
    const routes = [
        { name: 'Auth', router: authRoutes, path: '/api/auth' },
        { name: 'Admission', router: admissionRoutes, path: '/api/admission' },
        { name: 'Students', router: studentRoutes, path: '/api/students' },
        { name: 'Sections', router: sectionRoutes, path: '/api/sections' },
        { name: 'Faculty', router: facultyRoutes, path: '/api/faculty' },
        { name: 'Payments', router: paymentRoutes, path: '/api/payments' },
        { name: 'Reports', router: reportRoutes, path: '/api/reports' },
        { name: 'Student Status', router: studentStatusRoutes, path: '/api/student-status' },
        { name: 'Curriculum', router: curriculumRoutes, path: '/api/curriculum' },
        { name: 'Subjects', router: subjectsRoutes, path: '/api/subjects' }
    ];

    routes.forEach(({ name, router, path: basePath }) => {
        if (router && router.stack) {
            console.log(`\n  ${name}:`);
            router.stack.forEach(layer => {
                if (layer.route) {
                    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                    console.log(`    ${methods.padEnd(10)} ${basePath}${layer.route.path}`);
                }
            });
        }
    });
    console.log('\n');
}

// ============================================
// ERROR HANDLERS (Must be last!)
// ============================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            '/api/health',
            '/api/db-health',
            '/api/auth',
            '/api/admission',
            '/api/students',
            '/api/sections',
            '/api/faculty',
            '/api/payments',
            '/api/reports',
            '/api/student-status',
            '/api/curriculum',
            '/api/subjects'
        ]
    });
});

// 404 handler for pages (serve 404.html if it exists)
app.use((req, res, next) => {
    const notFoundPath = path.join(frontendPath, 'pages/public/404.html');
    res.status(404).sendFile(notFoundPath, (err) => {
        if (err) {
            res.status(404).json({ 
                error: 'Page not found',
                path: req.path 
            });
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Log stack trace in development
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    
    res.status(err.status || 500).json({ 
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// START SERVER
// ============================================

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

const server = app.listen(PORT, () => {
    console.log('\n========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend path: ${frontendPath}`);
    console.log('========================================\n');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('   Try a different port or kill the process using this port');
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

module.exports = app;
