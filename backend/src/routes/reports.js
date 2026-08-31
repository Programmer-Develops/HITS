const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET /api/reports — Get all reports (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Report.countDocuments();
    const reports = await Report.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, reports, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/today — Get today's reports only
router.get('/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const reports = await Report.find({ 
      timestamp: { $gte: startOfDay } 
    }).sort({ timestamp: -1 });

    res.json({ success: true, reports, count: reports.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/stats — Dashboard summary stats
router.get('/stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Report.countDocuments({ timestamp: { $gte: startOfDay } });
    const totalCount = await Report.countDocuments();
    const latestReport = await Report.findOne().sort({ timestamp: -1 });

    res.json({ 
      success: true, 
      todayCount, 
      totalCount,
      latestReport
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
