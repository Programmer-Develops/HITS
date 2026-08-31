require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const webhookRoute = require('./routes/webhook');
const workersRoute = require('./routes/workers');
const blocksRoute = require('./routes/blocks');
const reportsRoute = require('./routes/reports');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use('/webhook', webhookRoute);
app.use('/api/workers', workersRoute);
app.use('/api/blocks', blocksRoute);
app.use('/api/reports', reportsRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'HITS Sanitation Bot is running! 🚀',
    time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hits_sanitation')
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

module.exports = { app };
