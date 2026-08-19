const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const webhookRoute = require('../backend/src/routes/webhook');
const workersRoute = require('../backend/src/routes/workers');
const blocksRoute = require('../backend/src/routes/blocks');
const reportsRoute = require('../backend/src/routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected in Vercel');
  } catch (err) {
    console.error('❌ MongoDB Vercel error:', err.message);
  }
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/webhook', webhookRoute);
app.use('/api/workers', workersRoute);
app.use('/api/blocks', blocksRoute);
app.use('/api/reports', reportsRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'HITS Vercel API is live! 🚀', time: new Date().toISOString() });
});

module.exports = app;
