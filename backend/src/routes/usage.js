// ─────────────────────────────────────
// usage.js — Usage data ke routes
// C++ engine se data aata hai yahan
// MongoDB mein save hota hai
// ─────────────────────────────────────
const express  = require('express');
const axios    = require('axios');
const Usage    = require('../models/Usage');
const { protect } = require('../middleware/auth');
const router   = express.Router();
// ─────────── ─ ─────────────────────────
// Helper — Current billing month nikalo
// Format: "2026-03"
// ─────────────────────────────────────
const getCurrentMonth = () => {
    const now = new Date();
    // Month 0-indexed hota hai — isliye +1
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
};
// ─────────────────────────────────────
// POST /api/usage/record
// C++ engine ko call karo — usage record karo
// Body: { tenantId, storageGB, apiCalls, bandwidthGB }
// ─────────────────────────────────────
router.post('/record', protect, async (req, res) => {
    try {
        const { storageGB, apiCalls, bandwidthGB } = req.body;
        // tenantId logged in user se lo
        const tenantId = req.user.tenantId;
        // ─────────────────────────────
        // Step 1: C++ engine ko call karo
        // Usage record karne ke liye
        // ─────────────────────────────
        await axios.post(`${process.env.CPP_ENGINE_URL}/usage`, {
            tenantId,
            storageGB:   storageGB   || 0,
            apiCalls:    apiCalls    || 0,
            bandwidthGB: bandwidthGB || 0
        });
        // ─────────────────────────────
        // Step 2: MongoDB mein bhi save karo
        // findOneAndUpdate — agar exist kare toh update
        // nahi toh naya banao (upsert: true)
        // ─────────────────────────────
        const billingMonth = getCurrentMonth();
        const usage = await Usage.findOneAndUpdate(
            { tenantId, billingMonth },  // ye dhundho
            {
                // $inc = increment — add karo existing mein
                $inc: {
                    storageGB,
                    apiCalls,
                    bandwidthGB
                }
            },
            { 
                upsert: true,   // nahi mila toh banao
                new:    true    // updated document return karo
            }
        );
        res.status(200).json({
            success: true,
            message: 'Usage recorded',
            data:    usage
        });
    } catch (error) {
        console.log('Usage record error:', error.message);
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// GET /api/usage/current
// Current month ki usage dekho
// ─────────────────────────────────────
router.get('/current', protect, async (req, res) => {
    try {
        const tenantId     = req.user.tenantId;
        const billingMonth = getCurrentMonth();

        // MongoDB se current month ki usage lo
        const usage = await Usage.findOne({ tenantId, billingMonth });

        if (!usage) {
            // Koi usage nahi hai abhi tak
            return res.json({
                success:     true,
                tenantId,
                billingMonth,
                storageGB:   0,
                apiCalls:    0,
                bandwidthGB: 0
            });
        }
        res.json({
            success: true,
            data:    usage
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// GET /api/usage/history
// Sare mahino ki usage history dekho
// ─────────────────────────────────────
router.get('/history', protect, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        // Sari usage records lo — latest pehle
        const history = await Usage.find({ tenantId })
            .sort({ billingMonth: -1 })  // latest pehle
            .limit(12);                   // last 12 months
            res.json({
            success: true,
            count:   history.length,
            data:    history
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// GET /api/usage/realtime
// C++ engine se live usage lo
// ─────────────────────────────────────
router.get('/realtime', protect, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        // C++ engine se live data lo
        const response = await axios.get(
            `${process.env.CPP_ENGINE_URL}/usage/${tenantId}`
        );
        res.json({
            success: true,
            data:    response.data
        });
    } catch (error) {
        // Tenant ka data nahi mila C++ engine mein
        if (error.response && error.response.status === 404) {
            return res.json({
                success:     true,
                tenantId:    req.user.tenantId,
                storageGB:   0,
                apiCalls:    0,
                bandwidthGB: 0
            });
        }
        res.status(500).json({ error: error.message });
    }
    });

    // ─────────────────────────────────────
// POST /api/usage/sync
// MongoDB se C++ engine mein data load karo
// Server restart ke baad call karo
// ─────────────────────────────────────
router.post('/sync', protect, async (req, res) => {
    try {
        const tenantId     = req.user.tenantId;
        const billingMonth = getCurrentMonth();

        const usage = await Usage.findOne({ tenantId, billingMonth });

        if (!usage) {
            return res.json({
                success: true,
                message: 'Koi data nahi mila sync karne ke liye'
            });
        }

        await axios.post(`${process.env.CPP_ENGINE_URL}/usage`, {
            tenantId,
            storageGB:   usage.storageGB,
            apiCalls:    usage.apiCalls,
            bandwidthGB: usage.bandwidthGB
        });

        res.json({
            success: true,
            message: 'Data synced!',
            data:    usage
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
