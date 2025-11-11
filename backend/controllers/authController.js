// controllers/authController.js - ONLY logic & responses
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');
require('dotenv').config();

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

        // Get user from database
        const user = await AuthModel.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid username or password' 
            });
        }

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
        await AuthModel.updateLastLogin(user.user_id);

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

const verifyToken = (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
};

const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await AuthModel.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found',
                message: 'User does not exist' 
            });
        }

        res.json({
            success: true,
            user
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
