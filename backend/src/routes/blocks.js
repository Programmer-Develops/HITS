const express = require('express');
const router = express.Router();
const Block = require('../models/Block');

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
router.post('/', async (req, res) => {
  try {
    const { name, nameHindi, location } = req.body;
    const block = new Block({ name, nameHindi, location });
    await block.save();
    res.json({ success: true, block });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/blocks/:id — Update block
router.patch('/:id', async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
