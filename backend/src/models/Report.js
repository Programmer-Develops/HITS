const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  workerPhone: { type: String, required: true },
  workerName: { type: String, required: true },
  workerNameHindi: { type: String },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', default: null },
  blockName: { type: String, default: 'Unknown Block' },
  blockNameHindi: { type: String, default: 'अज्ञात स्थान' },
  photoUrl: { type: String, required: true },    // Cloudinary URL
  photoPublicId: { type: String },               // Cloudinary public ID
  caption: { type: String, default: '' },        // Worker's message caption if any
  timestamp: { type: Date, default: Date.now },
  timeIST: { type: String },                     // Human-readable IST time
  status: { 
    type: String, 
    enum: ['received', 'verified', 'flagged'], 
    default: 'received' 
  }
});

module.exports = mongoose.model('Report', reportSchema);
