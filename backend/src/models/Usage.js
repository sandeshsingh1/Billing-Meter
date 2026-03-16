// ─────────────────────────────────────
// Usage.js — C++ Engine se aaya hua
// usage data MongoDB mein save karne ke liye
// ─────────────────────────────────────

const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({

    // Kaun sa tenant hai
    tenantId: {
        type:     String,
        required: true,
        // Index lagao — fast search ke liye
        index:    true
    },

    // Storage kitna use kiya (GB mein)
    storageGB: {
        type:    Number,
        default: 0
    },

    // Kitni API calls ki
    apiCalls: {
        type:    Number,
        default: 0
    },

    // Bandwidth kitna use kiya (GB mein)
    bandwidthGB: {
        type:    Number,
        default: 0
    },

    // Kaunsa mahina hai ye usage
    // "2026-03" format mein
    billingMonth: {
        type:     String,
        required: true
    },

    // Kab record kiya
    recordedAt: {
        type:    Date,
        default: Date.now
    }
});

// ─────────────────────────────────────
// Compound index — tenantId + billingMonth
// Matlab: ek tenant ka ek mahine mein 
// sirf ek record hoga
// ─────────────────────────────────────
usageSchema.index({ tenantId: 1, billingMonth: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);