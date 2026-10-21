const mongoose = require('mongoose');

const REPORT_STATUSES = ['received', 'verified', 'flagged'];

const reportSchema = new mongoose.Schema(
  {
    workerPhone: { type: String, required: true, trim: true },
    workerName: { type: String, required: true, trim: true },
    workerNameHindi: { type: String, trim: true },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', default: null },
    blockName: { type: String, default: 'Unknown Block', trim: true },
    blockNameHindi: { type: String, default: 'अज्ञात स्थान', trim: true },
    photoUrl: { type: String, required: true, trim: true },
    photoPublicId: { type: String, trim: true },
    caption: { type: String, default: '', trim: true },
    timestamp: { type: Date, default: Date.now },
    timeIST: { type: String, trim: true },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'received'
    }
  }
);

reportSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Report', reportSchema);
