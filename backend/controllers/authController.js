const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Validation failed',
                message: 'Username and password are required' 
            });
        }

        // Find user in database
        const [users] = await db.query(
            'SELECT user_id, username, password_hash, email, full_name, role, is_active FROM users WHERE username = ?',
            [username]
        );

        console.log('Found users:', users.length); // ADD THIS
        console.log('User data:', users[0]); // ADD THIS

        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid username or password' 
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ 
                error: 'Account disabled',
                message: 'Your account has been deactivated. Contact administrator.' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid username or password' 
            });
        }

        // Update last login
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                fullName: user.full_name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        // Send response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'An error occurred during login' 
        });
    }
};

// Verify token
const verifyToken = (req, res) => {
    // If middleware passed, token is valid
    res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
};

// Logout (client-side will remove token)
const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

// Get current user info
const getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, username, email, full_name, role, last_login, created_at FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                error: 'User not found',
                message: 'User does not exist' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to fetch user information' 
        });
    }
};

module.exports = {
    login,
    verifyToken,
    logout,
    getCurrentUser
};
