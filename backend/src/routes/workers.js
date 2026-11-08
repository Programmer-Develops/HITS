const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Report = require('../models/Report');
const {
  isObjectId,
  formatPhone,
  isValidPhone,
  sanitizeBlockIds,
  getAssignedBlockIds
} = require('../utils/helpers');
const { completeNames } = require('../services/translate');

const DUPLICATE_PHONE_MSG = 'This phone number is already registered';
const INVALID_PHONE_MSG = 'Enter a valid 10-digit Indian mobile number';

// GET /api/workers — Get all workers
// Every worker comes back with a normalised `assignedBlocks` array, even
// records saved before multi-block support (they only had `assignedBlock`).
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ addedAt: -1 }).lean();
    res.json({
      success: true,
      workers: workers.map((w) => ({ ...w, assignedBlocks: getAssignedBlockIds(w) }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/workers — Add new worker
// The admin only has to type ONE name (English or Hindi); the other is filled in.
router.post('/', async (req, res) => {
  try {
    const { name, nameHindi, phone, assignedBlocks, assignedBlock } = req.body;

    const names = await completeNames('name', { name, nameHindi });
    if (!names.name) {
      return res.status(400).json({ success: false, error: 'Worker name is required' });
    }

    const formattedPhone = formatPhone(phone);
    if (!isValidPhone(formattedPhone)) {
      return res.status(400).json({ success: false, error: INVALID_PHONE_MSG });
    }

    const worker = new Worker({
      name: names.name,
      nameHindi: names.nameHindi,
      phone: formattedPhone,
      // `assignedBlock` (single) is still accepted so older clients keep working
      assignedBlocks: sanitizeBlockIds(assignedBlocks ?? assignedBlock)
    });
    await worker.save();
    res.json({ success: true, worker, translation: { generated: names.generated, ok: names.ok } });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, error: DUPLICATE_PHONE_MSG });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// PATCH /api/workers/:id — Edit worker (name, phone, blocks) or toggle active
// Only whitelisted fields are applied; the request body is never written to the DB as-is.
router.patch('/:id', async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid worker id' });
    }

    const { name, nameHindi, phone, assignedBlocks, assignedBlock, isActive } = req.body;
    const update = {};

    if (name !== undefined || nameHindi !== undefined) {
      const existing = await Worker.findById(req.params.id).lean();
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      // A changed name without its pair means "regenerate the other language".
      const names = await completeNames('name', {
        name: name !== undefined ? name : nameHindi !== undefined ? '' : existing.name,
        nameHindi: nameHindi !== undefined ? nameHindi : name !== undefined ? '' : existing.nameHindi
      });
      if (!names.name) {
        return res.status(400).json({ success: false, error: 'Worker name is required' });
      }
      update.name = names.name;
      update.nameHindi = names.nameHindi;
    }

    if (phone !== undefined) {
      const formattedPhone = formatPhone(phone);
      if (!isValidPhone(formattedPhone)) {
        return res.status(400).json({ success: false, error: INVALID_PHONE_MSG });
      }
      update.phone = formattedPhone;
    }

    if (typeof isActive === 'boolean') update.isActive = isActive;

    const blocksProvided = assignedBlocks !== undefined || assignedBlock !== undefined;
    if (blocksProvided) update.assignedBlocks = sanitizeBlockIds(assignedBlocks ?? assignedBlock);

    const ops = { $set: update };
    // Drop the legacy single-block field whenever blocks are edited. Otherwise
    // clearing the list would make the old block "reappear" for that worker.
    if (blocksProvided) ops.$unset = { assignedBlock: '' };

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'Nothing to update' });
    }

    const worker = await Worker.findByIdAndUpdate(req.params.id, ops, {
      new: true,
      runValidators: true
    });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Reports keep a copy of the worker's name; keep those in step with a rename.
    if (update.name) {
      await Report.updateMany(
        { workerPhone: worker.phone },
        { $set: { workerName: worker.name, workerNameHindi: worker.nameHindi } }
      );
    }
    res.json({ success: true, worker });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, error: DUPLICATE_PHONE_MSG });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// DELETE /api/workers/:id — Remove worker
router.delete('/:id', async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Worker removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
