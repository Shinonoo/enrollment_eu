// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'User not authenticated' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Forbidden',
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
            });
        }

        next();
    };
};

module.exports = { checkRole };
