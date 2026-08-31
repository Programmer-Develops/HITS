const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g. "Boys Toilet Ground Floor"
  nameHindi: { type: String, required: true },   // e.g. "लड़कों का शौचालय (भूतल)"
  location: { type: String },                    // e.g. "Ground Floor, Block A"
  isActive: { type: Boolean, default: true },
  lastCleaned: { type: Date, default: null },
  lastCleanedBy: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['clean', 'dirty', 'unknown'], 
    default: 'unknown' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Block', blockSchema);
