const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const Report = require('../models/Report');
const { isObjectId } = require('../utils/helpers');
const { completeNames } = require('../services/translate');

// Reports keep a copy of the block's name (so history survives a deleted block).
// When a block is renamed, bring those copies up to date.
const propagateBlockNames = (block) =>
  Report.updateMany(
    { blockId: block._id },
    { $set: { blockName: block.name, blockNameHindi: block.nameHindi } }
  );

// GET /api/blocks — Get all blocks with status
router.get('/', async (req, res) => {
  try {
    const blocks = await Block.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, blocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/blocks — Add new block
// The admin only has to type ONE name (English or Hindi); the other is filled in.
router.post('/', async (req, res) => {
  try {
    const { name, nameHindi, location } = req.body;
    const names = await completeNames('block', { name, nameHindi });
    if (!names.name) {
      return res.status(400).json({ success: false, error: 'Block name is required' });
    }
    const block = new Block({
      name: names.name,
      nameHindi: names.nameHindi,
      location: typeof location === 'string' ? location.trim() : undefined
    });
    await block.save();
    res.json({ success: true, block, translation: { generated: names.generated, ok: names.ok } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/blocks/:id — Edit a block (names / location). Only these fields are accepted;
// status and last-cleaned are managed by the WhatsApp reports, not by the admin form.
router.patch('/:id', async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid block id' });
    }
    const { name, nameHindi, location } = req.body;
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, error: 'Block not found' });
    }

    if (name !== undefined || nameHindi !== undefined) {
      // A changed name without its pair means "regenerate the other language".
      const names = await completeNames('block', {
        name: name !== undefined ? name : nameHindi !== undefined ? '' : block.name,
        nameHindi: nameHindi !== undefined ? nameHindi : name !== undefined ? '' : block.nameHindi
      });
      if (!names.name) {
        return res.status(400).json({ success: false, error: 'Block name is required' });
      }
      block.name = names.name;
      block.nameHindi = names.nameHindi;
    }
    if (location !== undefined) {
      block.location = typeof location === 'string' ? location.trim() : '';
    }

    await block.save();
    await propagateBlockNames(block);
    res.json({ success: true, block });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/blocks/:id — Remove block
router.delete('/:id', async (req, res) => {
  try {
    await Block.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Block removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/blocks/seed — Seed default HITS school blocks
router.post('/seed', async (req, res) => {
  try {
    const defaultBlocks = [
      { name: 'Boys Toilet - Ground Floor', nameHindi: 'लड़कों का शौचालय (भूतल)', location: 'Ground Floor' },
      { name: 'Girls Toilet - Ground Floor', nameHindi: 'लड़कियों का शौचालय (भूतल)', location: 'Ground Floor' },
      { name: 'Boys Toilet - First Floor', nameHindi: 'लड़कों का शौचालय (प्रथम तल)', location: 'First Floor' },
      { name: 'Girls Toilet - First Floor', nameHindi: 'लड़कियों का शौचालय (प्रथम तल)', location: 'First Floor' },
      { name: 'Staff Toilet', nameHindi: 'स्टाफ शौचालय', location: 'Staff Area' },
      { name: 'School Campus', nameHindi: 'विद्यालय परिसर', location: 'General' },
    ];
    await Block.insertMany(defaultBlocks);
    res.json({ success: true, message: 'Default blocks created!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
