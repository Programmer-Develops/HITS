const axios = require('axios');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Send a Hindi text message to a WhatsApp number
 */
const sendHindiReply = async (to, message) => {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.log('⚠️ WhatsApp credentials not set — skipping auto-reply');
    console.log(`📩 Would have sent to ${to}: ${message}`);
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Hindi reply sent to ${to}`);
  } catch (err) {
    const metaError = err.response?.data?.error;
    console.error('❌ WhatsApp send error:', {
      to,
      httpStatus: err.response?.status,
      metaCode: metaError?.code,
      metaMessage: metaError?.message,
      metaSubcode: metaError?.error_subcode,
      raw: err.message
    });
  }
};

/**
 * Build Hindi confirmation message for worker
 */
const buildConfirmationMessage = (workerName, blockNameHindi, timeIST) => {
  return `✅ *रिपोर्ट दर्ज हो गई है!*\n\n` +
    `👤 कर्मचारी: ${workerName}\n` +
    `📍 स्थान: ${blockNameHindi}\n` +
    `⏰ समय: ${timeIST}\n\n` +
    `आपकी सफ़ाई की फ़ोटो प्राप्त हो गई है। धन्यवाद! 🙏`;
};

/**
 * Message for unregistered numbers
 */
const buildUnauthorizedMessage = () => {
  return `⚠️ आपका नंबर इस सिस्टम में पंजीकृत नहीं है।\n` +
    `कृपया प्रधानाचार्य से संपर्क करें।`;
};

/**
 * Message for non-photo messages
 */
const buildPhotoRequiredMessage = () => {
  return `📸 कृपया केवल सफ़ाई की *फ़ोटो* भेजें।\n` +
    `टेक्स्ट संदेश स्वीकार नहीं किए जाते।`;
};

module.exports = { 
  sendHindiReply, 
  buildConfirmationMessage,
  buildUnauthorizedMessage,
  buildPhotoRequiredMessage
};
