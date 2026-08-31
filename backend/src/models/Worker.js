const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHindi: { type: String }, // Name in Hindi
  phone: { type: String, required: true, unique: true }, // WhatsApp number e.g. 919876543210
  assignedBlock: { type: String }, // Default block assigned
  isActive: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', workerSchema);
