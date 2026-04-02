// ─────────────────────────────────────
// index.js — Main server file
// Sab kuch yahan se start hota hai
// ─────────────────────────────────────
const express  = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const objectRoutes = require("./routes/object");// ─────────────────────────────────────
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
app.use("/api/objects", objectRoutes);
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
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        console.log('DB Name:', mongoose.connection.db.databaseName); // ← ADD
        console.log('Host:', mongoose.connection.host);                // ← ADD
        app.listen(process.env.PORT, () => {
            console.log(`✅ Server running on port ${process.env.PORT}`);
        });
    })


