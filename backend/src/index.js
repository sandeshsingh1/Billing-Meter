// ─────────────────────────────────────
// index.js — Main server file
// Sab kuch yahan se start hota hai
// ─────────────────────────────────────
const express  = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
// ─────────────────────────────────────
// MIDDLEWARE SETUP
// ─────────────────────────────────────
const cors = require("cors");
app.use(cors({ origin: "*" }));
app.use(express.json());   // JSON body parse karo

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/usage',   require('./routes/usage'));
app.use('/api/billing', require('./routes/billing'));

// Health check — server chal raha hai ya nahi
app.get('/health', (req, res) => {
    res.json({ 
        status:  'OK', 
        message: 'Billing Engine API running' 
    });
});
// ─────────────────────────────────────
// MongoDB se connect karo aur server start karo
// ─────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI||5000)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`✅ Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ MongoDB error:', err));
    // Unhandled errors catch karo
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION:', err.stack);
});
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION:', err.stack);
});


