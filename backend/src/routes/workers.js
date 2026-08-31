const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');

// GET /api/workers — Get all workers
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ addedAt: -1 });
    res.json({ success: true, workers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/workers — Add new worker
router.post('/', async (req, res) => {
  try {
    const { name, nameHindi, phone, assignedBlock } = req.body;
    
    // Format phone: ensure it starts with 91 (India)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '91' + formattedPhone.slice(1);
    if (!formattedPhone.startsWith('91')) formattedPhone = '91' + formattedPhone;

    const worker = new Worker({ 
      name, 
      nameHindi: nameHindi || name, 
      phone: formattedPhone,
      assignedBlock: assignedBlock || null
    });
    await worker.save();
    res.json({ success: true, worker });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, error: 'This phone number is already registered' });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// PATCH /api/workers/:id — Update worker (toggle active, change block)
router.patch('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
