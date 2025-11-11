// models/authModel.js - ONLY database queries
const db = require('../config/dbLogger');

exports.getUserByUsername = async (username) => {
    const [users] = await db.query(
        'SELECT user_id, username, password_hash, email, full_name, role, is_active FROM users WHERE username = ?',
        [username]
    );
    return users[0] || null;
};

exports.updateLastLogin = async (userId) => {
    await db.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = ?',
        [userId]
    );
};

exports.getUserById = async (userId) => {
    const [users] = await db.query(
        'SELECT user_id, username, email, full_name, role, last_login, created_at FROM users WHERE user_id = ?',
        [userId]
    );
    return users[0] || null;
};
