// ─────────────────────────────────────
// auth.js — Login aur Signup ke routes
// ─────────────────────────────────────
const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const router   = express.Router();
// ─────────────────────────────────────
// Helper — JWT Token banana
// ─────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};
// ─────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, tenantId } = req.body;

        // Email already exist karta hai?
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                error: 'Email already registered hai'
            });
        }
        // TenantId already exist karta hai?
        const tenantExists = await User.findOne({ tenantId });
        if (tenantExists) {
            return res.status(400).json({
                error: 'TenantId already exist karta hai'
            });
        }
        // Naya user banao
        const user = await User.create({
            tenantId,
            name,
            email,
            password
        });
        res.status(201).json({
            success:  true,
            token:    generateToken(user._id),
            tenantId: user.tenantId,
            name:     user.name,
            email:    user.email,
            role:     user.role
        });
    } catch (error) {
        console.log('ERROR:', error.stack);
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email se user dhundho
        const user = await User.findOne({ email });

        // Password check karo
        if (user && (await user.matchPassword(password))) {
            res.json({
                success:  true,
                token:    generateToken(user._id),
                tenantId: user.tenantId,
                name:     user.name,
                email:    user.email,
                role:     user.role
            });
        } else {
            res.status(401).json({
                error: 'Email ya password galat hai'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// GET /api/auth/me
// Apni profile dekho
// ─────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            success:  true,
            tenantId: user.tenantId,
            name:     user.name,
            email:    user.email,
            role:     user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
