// ─────────────────────────────────────
// auth.js — JWT Token verify karna
// Har protected route pe ye check hoga
// ─────────────────────────────────────

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────
// protect — middleware function
// req  = request (aane wala data)
// res  = response (bhejne wala data)
// next = aage jao (next function chalao)
// ─────────────────────────────────────
const protect = async (req, res, next) => {
    let token;
    // Header mein token hai?
    // Format: "Bearer eyJhbGc..."
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer TOKEN" se sirf TOKEN nikalo
            token = req.headers.authorization.split(' ')[1];

            // Token verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // User database se lo, password chhod do
            req.user = await User.findById(decoded.id).select('-password');

            // Aage jao — next middleware ya route
            return next();

        } catch (error) {
            return res.status(401).json({
                error: 'Token invalid hai, login karo'
            });
        }
    }

    // Token hai hi nahi
    if (!token) {
        return res.status(401).json({
            error: 'Access denied, token nahi mila'
        });
    }
};

module.exports = { protect };