const { app } = require('../src/app');

// Vercel serverless function entrypoint
// We export the Express app directly for Vercel to consume
module.exports = app;
