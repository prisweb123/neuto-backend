const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        console.log('Auth middleware - checking authorization header');
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found in authorization header');
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        try {
            console.log('Verifying token...');
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified, finding user...');
            req.user = await User.findById(decoded.id);
            console.log('User found:', req.user ? req.user._id : 'No user found');
            next();
        } catch (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }
    } catch (err) {
        console.error('Error in auth middleware:', err);
        res.status(500).json({ message: 'Error in auth middleware', error: err.message });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};