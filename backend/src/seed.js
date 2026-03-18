// ─────────────────────────────────────
// seed.js — Fake historical data daalo
// ML predictions ke liye 6 months ka
// data chahiye
// ─────────────────────────────────────

const mongoose = require('mongoose');
const Usage    = require('./models/Usage');
require('dotenv').config();

// ─────────────────────────────────────
// 6 months ka fake data
// Har mahine usage badh raha hai
// (realistic growth pattern)
// ─────────────────────────────────────
const seedData = [
    { month: '2025-10', storage: 20,  apiCalls: 50000,  bandwidth: 10 },
    { month: '2025-11', storage: 35,  apiCalls: 80000,  bandwidth: 15 },
    { month: '2025-12', storage: 50,  apiCalls: 110000, bandwidth: 20 },
    { month: '2026-01', storage: 65,  apiCalls: 130000, bandwidth: 28 },
    { month: '2026-02', storage: 80,  apiCalls: 150000, bandwidth: 35 },
    { month: '2026-03', storage: 100, apiCalls: 180000, bandwidth: 40 },
];

const seedDB = async () => {
    try {
        // MongoDB connect karo
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Pehle purana data delete karo
        await Usage.deleteMany({ tenantId: 't001' });
        console.log('🗑️ Old data deleted');

        // Naya data insert karo
        for (const d of seedData) {
            await Usage.create({
                tenantId:     't001',
                billingMonth: d.month,
                storageGB:    d.storage,
                apiCalls:     d.apiCalls,
                bandwidthGB:  d.bandwidth
            });
            console.log(`✅ ${d.month} data inserted`);
        }

        console.log('🎉 Seed complete!');
        process.exit(0);

    } catch (error) {
        console.log('❌ Error:', error.message);
        process.exit(1);
    }
};

seedDB();