const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Block = require('../models/Block');
const Report = require('../models/Report');
const { detectScript, convert, completeNames, isHindiText } = require('../services/translate');

/* ---- tiny per-IP throttle: this endpoint calls third-party services ---- */
const hits = new Map();
const LIMIT = 60;          // requests
const WINDOW_MS = 60_000;  // per minute
const throttle = (req, res, next) => {
  const ip = String(req.headers['x-forwarded-for'] || req.ip || 'x').split(',')[0].trim();
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    if (hits.size > 1000) hits.clear();
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return next();
  }
  if (++entry.count > LIMIT) {
    return res.status(429).json({ success: false, error: 'Too many requests, slow down' });
  }
  next();
};

// GET /api/translate?kind=name|block&text=Ved Prakash
// Used by the admin forms to show the other-language version while typing.
// -> { success, from: 'en'|'hi', en, hi, via }   (the other side is null if unavailable)
router.get('/', throttle, async (req, res) => {
  try {
    const kind = req.query.kind === 'block' ? 'block' : 'name';
    const text = typeof req.query.text === 'string' ? req.query.text.trim().slice(0, 120) : '';
    const script = detectScript(text);

    if (!text || (script !== 'en' && script !== 'hi')) {
      return res.json({ success: true, from: null, en: null, hi: null, via: null });
    }

    const result = await convert(kind, text, script);
    res.json({
      success: true,
      from: script,
      en: script === 'en' ? text : result?.text ?? null,
      hi: script === 'hi' ? text : result?.text ?? null,
      via: result?.via ?? null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/repair[?dryRun=1]
// One-off clean-up of existing data: English saved in a Hindi field (or the other way
// round) is fixed, and missing translations are filled in. With dryRun=1 nothing is
// written; you just get the list of what WOULD change.
router.post('/repair', async (req, res) => {
  try {
    const dryRun = ['1', 'true'].includes(String(req.query.dryRun));
    const changes = [];

    const blocks = await Block.find();
    const workers = await Worker.find();
    const hindiByEnName = new Map();

    for (const w of workers) {
      const fixed = await completeNames('name', { name: w.name, nameHindi: w.nameHindi });
      if (fixed.name && fixed.nameHindi) hindiByEnName.set(fixed.name.toLowerCase(), fixed.nameHindi);
      if (fixed.name === w.name && fixed.nameHindi === w.nameHindi) continue;
      changes.push({
        type: 'worker',
        id: String(w._id),
        before: { name: w.name, nameHindi: w.nameHindi },
        after: { name: fixed.name, nameHindi: fixed.nameHindi }
      });
      if (!dryRun) {
        await Worker.updateOne({ _id: w._id }, { $set: { name: fixed.name, nameHindi: fixed.nameHindi } });
        await Report.updateMany(
          { workerPhone: w.phone },
          { $set: { workerName: fixed.name, workerNameHindi: fixed.nameHindi } }
        );
      }
    }

    for (const b of blocks) {
      const fixed = await completeNames('block', { name: b.name, nameHindi: b.nameHindi });
      const nameChanged = fixed.name !== b.name || fixed.nameHindi !== b.nameHindi;

      let cleanerHi = b.lastCleanedByHindi || null;
      if (b.lastCleanedBy) {
        const mapped = hindiByEnName.get(String(b.lastCleanedBy).trim().toLowerCase());
        if (mapped) {
          cleanerHi = mapped;
        } else if (!cleanerHi || !isHindiText(cleanerHi)) {
          const fc = await completeNames('name', { name: b.lastCleanedBy, nameHindi: '' });
          if (fc.nameHindi && isHindiText(fc.nameHindi)) cleanerHi = fc.nameHindi;
        }
      }
      const cleanerChanged = Boolean(cleanerHi && cleanerHi !== b.lastCleanedByHindi);

      if (!nameChanged && !cleanerChanged) continue;
      if (nameChanged) {
        changes.push({
          type: 'block',
          id: String(b._id),
          before: { name: b.name, nameHindi: b.nameHindi },
          after: { name: fixed.name, nameHindi: fixed.nameHindi }
        });
      }
      if (!dryRun) {
        b.name = fixed.name;
        b.nameHindi = fixed.nameHindi;
        if (cleanerChanged) b.lastCleanedByHindi = cleanerHi;
        await b.save();
        if (nameChanged) {
          await Report.updateMany(
            { blockId: b._id },
            { $set: { blockName: b.name, blockNameHindi: b.nameHindi } }
          );
        }
      }
    }

    res.json({ success: true, dryRun, changed: changes.length, changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
