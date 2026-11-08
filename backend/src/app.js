require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const webhookRoute = require('./routes/webhook');
const workersRoute = require('./routes/workers');
const blocksRoute = require('./routes/blocks');
const reportsRoute = require('./routes/reports');
const translateRoute = require('./routes/translate');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use('/webhook', webhookRoute);
app.use('/api/workers', workersRoute);
app.use('/api/blocks', blocksRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/translate', translateRoute);

// Lightweight status ping used by the dashboard's connection indicator
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'HITS Sanitation Bot is running! 🚀',
    time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  });
});

// MongoDB connection is handled exclusively by api/index.js (Vercel entrypoint)
// This prevents double-connect race conditions on cold starts

module.exports = { app };
