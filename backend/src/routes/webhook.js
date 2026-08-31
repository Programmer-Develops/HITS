const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Block = require('../models/Block');
const Report = require('../models/Report');
const { uploadPhotoFromMeta } = require('../services/cloudinary');
const { 
  sendHindiReply, 
  buildConfirmationMessage,
  buildUnauthorizedMessage,
  buildPhotoRequiredMessage
} = require('../services/whatsapp');

// GET /webhook — Meta verification handshake
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// POST /webhook — Incoming WhatsApp messages from Meta
router.post('/', async (req, res) => {
  // Always respond 200 immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const changes = body.entry?.[0]?.changes?.[0]?.value;
    if (!changes?.messages?.[0]) return;

    const message = changes.messages[0];
    const senderPhone = message.from; // e.g. "919876543210"
    const messageType = message.type; // "image", "text", etc.

    console.log(`📩 Message from ${senderPhone}, type: ${messageType}`);

    // Check if sender is a registered worker
    const worker = await Worker.findOne({ phone: senderPhone, isActive: true });

    if (!worker) {
      console.log(`🚫 Unregistered number: ${senderPhone}`);
      await sendHindiReply(senderPhone, buildUnauthorizedMessage());
      return;
    }

    // Only process image messages
    if (messageType !== 'image') {
      console.log(`📝 Non-photo message from ${worker.name} — ignoring`);
      await sendHindiReply(senderPhone, buildPhotoRequiredMessage());
      return;
    }

    // Process the photo
    const mediaId = message.image.id;
    const caption = message.image.caption || '';

    // Get IST time
    const now = new Date();
    const timeIST = now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Find worker's assigned block
    let block = null;
    if (worker.assignedBlock) {
      block = await Block.findById(worker.assignedBlock);
    }

    const blockName = block?.name || 'Unknown Block';
    const blockNameHindi = block?.nameHindi || 'अज्ञात स्थान';

    // Upload photo to Cloudinary
    const { url: photoUrl, publicId } = await uploadPhotoFromMeta(mediaId, senderPhone);

    // Save report to MongoDB
    const report = new Report({
      workerPhone: senderPhone,
      workerName: worker.name,
      workerNameHindi: worker.nameHindi || worker.name,
      blockId: block?._id || null,
      blockName,
      blockNameHindi,
      photoUrl,
      photoPublicId: publicId,
      caption,
      timeIST
    });
    await report.save();

    // Update block's last cleaned status
    if (block) {
      block.lastCleaned = now;
      block.lastCleanedBy = worker.name;
      block.status = 'clean';
      await block.save();
    }

    // Send Hindi confirmation to worker
    await sendHindiReply(
      senderPhone, 
      buildConfirmationMessage(worker.nameHindi || worker.name, blockNameHindi, timeIST)
    );

    console.log(`✅ Report saved & reply sent for ${worker.name} — Block: ${blockName}`);

  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
    console.error('Stack:', err.stack);
  }
});

module.exports = router;
