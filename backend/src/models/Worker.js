const mongoose = require('mongoose');

const normalizePhone = (phone) => {
  if (!phone) return phone;

  let normalizedPhone = String(phone).replace(/\D/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = `91${normalizedPhone.slice(1)}`;
  }

  return normalizedPhone.startsWith('91')
    ? normalizedPhone
    : `91${normalizedPhone}`;
};

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHindi: { type: String }, // Name in Hindi
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    set: normalizePhone
  },
  assignedBlock: { type: String }, // LEGACY single block — kept so old records still load; new code uses assignedBlocks
  assignedBlocks: { type: [String], default: [] }, // Blocks (Block _id strings) this worker is responsible for
  isActive: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now }
});

workerSchema.index({ addedAt: -1 });

module.exports = mongoose.model('Worker', workerSchema);
+