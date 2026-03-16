// ─────────────────────────────────────
// billing.js — Bill calculate karna
// aur invoices manage karna
// ─────────────────────────────────────

const express  = require('express');
const axios    = require('axios');
const Invoice  = require('../models/Invoice');
const Usage    = require('../models/Usage');
const { protect } = require('../middleware/auth');

const router   = express.Router();

// ─────────────────────────────────────
// Helper — Current billing month
// ─────────────────────────────────────
const getCurrentMonth = () => {
    const now   = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
};

// ─────────────────────────────────────
// GET /api/billing/current
// Current month ka bill dekho
// C++ engine se calculate hoga
// ─────────────────────────────────────
router.get('/current', protect, async (req, res) => {
    try {
        const tenantId = req.user.tenantId  // ← ye line zaroori hai
        
        const response = await axios.get(
            `${process.env.CPP_ENGINE_URL}/bill/${tenantId}`
        )
        // ...
    } catch (error) {
        if (error.response && error.response.status === 404) {
            const tenantId = req.user.tenantId  // ← catch mein bhi chahiye
            return res.json({
                success: true,
                data: {
                    tenantId,
                    storageCost:   0,
                    apiCallsCost:  0,
                    bandwidthCost: 0,
                    totalCost:     0,
                    currency:      'USD'
                }
            })
        }
        res.status(500).json({ error: error.message })
    }
})
// ─────────────────────────────────────
// POST /api/billing/generate
// Invoice generate karo current month ke liye
// ─────────────────────────────────────
router.post('/generate', protect, async (req, res) => {
    try {
        const tenantId     = req.user.tenantId;
        const billingMonth = getCurrentMonth();

        // Pehle check karo — invoice already bana hai?
        const existingInvoice = await Invoice.findOne({ 
            tenantId, 
            billingMonth 
        });
        
        if (existingInvoice) {
            return res.json({
                success: true,
                message: 'Invoice already exists',
                data:    existingInvoice
            });
        }

        // MongoDB se usage lo
        const usage = await Usage.findOne({ tenantId, billingMonth });
        
        if (!usage) {
            return res.status(404).json({ 
                error: 'Koi usage nahi mili is month ki' 
            });
        }

        // C++ engine se bill calculate karo
        const billResponse = await axios.get(
            `${process.env.CPP_ENGINE_URL}/bill/${tenantId}`
        );
        
        const bill = billResponse.data;

        // Invoice MongoDB mein save karo
        const invoice = await Invoice.create({
            tenantId,
            billingMonth,
            storageGB:     usage.storageGB,
            apiCalls:      usage.apiCalls,
            bandwidthGB:   usage.bandwidthGB,
            storageCost:   bill.storageCost,
            apiCallsCost:  bill.apiCallsCost,
            bandwidthCost: bill.bandwidthCost,
            totalCost:     bill.totalCost,
            currency:      bill.currency,
            status:        'pending'
        });
        res.status(201).json({
            success: true,
            message: 'Invoice generated!',
            data:    invoice
        });
    } catch (error) {
        console.log('Invoice error:', error.message);
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// GET /api/billing/invoices
// Sari invoices dekho
// ─────────────────────────────────────
router.get('/invoices', protect, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const invoices = await Invoice.find({ tenantId })
            .sort({ billingMonth: -1 });  // latest pehle

        res.json({
            success: true,
            count:   invoices.length,
            data:    invoices
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────
// PATCH /api/billing/pay/:invoiceId
// Invoice mark as paid
// ─────────────────────────────────────
router.patch('/pay/:invoiceId', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.invoiceId,
            { status: 'paid' },   // status paid karo
            { new: true }          // updated document return karo
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice nahi mili' });
        }

        res.json({
            success: true,
            message: 'Invoice paid!',
            data:    invoice
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;