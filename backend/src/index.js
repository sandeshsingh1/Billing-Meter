const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes (we'll fill these in Week 2)
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/usage',   require('./routes/usage'));
app.use('/api/billing', require('./routes/billing'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Billing Engine API running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));
  