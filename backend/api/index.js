const { app } = require('../src/app');
const mongoose = require('mongoose');
require('dotenv').config();

// Cache the connection promise so we don't reconnect on every request
let connectionPromise = null;

function ensureConnected() {
  // Already connected — reuse the existing connection
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  // Connection in progress — wait for it
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hits_sanitation')
      .then(() => {
        console.log('✅ MongoDB connected (via ensureConnected)');
      })
      .catch((err) => {
        connectionPromise = null; // Reset so next request retries
        throw err;
      });
  }
  return connectionPromise;
}

// Vercel serverless entrypoint
// Waits for MongoDB before handling any request, fixing cold-start timeouts
module.exports = async (req, res) => {
  await ensureConnected();
  return app(req, res);
};
