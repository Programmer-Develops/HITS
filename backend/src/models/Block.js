const mongoose = require('mongoose');

const BLOCK_STATUSES = ['clean', 'dirty', 'unknown'];

const blockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameHindi: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastCleaned: { type: Date, default: null },
    lastCleanedBy: { type: String, default: null, trim: true },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: BLOCK_STATUSES,
      default: 'unknown'
    }
  }
);

blockSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Block', blockSchema);
