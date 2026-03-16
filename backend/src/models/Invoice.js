// ─────────────────────────────────────
// Invoice.js — Bill ka record
// Har mahine ka bill yahan store hoga
// ─────────────────────────────────────

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({

    // Kaun sa tenant
    tenantId: {
        type:     String,
        required: true,
        index:    true
    },

    // Kaunsa mahina
    billingMonth: {
        type:     String,
        required: true
    },

    // Usage breakdown
    storageGB:   { type: Number, default: 0 },
    apiCalls:    { type: Number, default: 0 },
    bandwidthGB: { type: Number, default: 0 },

    // Cost breakdown
    storageCost:   { type: Number, default: 0 },
    apiCallsCost:  { type: Number, default: 0 },
    bandwidthCost: { type: Number, default: 0 },

    // Total bill
    totalCost: {
        type:     Number,
        required: true
    },

    // Currency
    currency: {
        type:    String,
        default: 'USD'
    },

    // Bill paid hua ya nahi
    status: {
        type:    String,
        enum:    ['pending', 'paid', 'overdue'],
        default: 'pending'
    },

    // Kab invoice generate hua
    generatedAt: {
        type:    Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);