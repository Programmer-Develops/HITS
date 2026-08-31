const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Download photo from Meta's servers and upload to Cloudinary
 * Returns { url, publicId }
 */
const uploadPhotoFromMeta = async (mediaId, workerPhone) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('⚠️ Cloudinary not configured — using placeholder');
    return { 
      url: 'https://placehold.co/400x300?text=Photo+Received', 
      publicId: null 
    };
  }

  try {
    // Step 1: Get the media URL from Meta
    const mediaResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
    const mediaUrl = mediaResponse.data.url;

    // Step 2: Download the image data
    const imageResponse = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      responseType: 'arraybuffer'
    });

    // Step 3: Upload to Cloudinary
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const publicId = `hits_sanitation/${workerPhone}_${timestamp}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId, folder: 'hits_sanitation' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(Buffer.from(imageResponse.data));
    });

    console.log(`✅ Photo uploaded to Cloudinary: ${result.secure_url}`);
    return { url: result.secure_url, publicId: result.public_id };

  } catch (err) {
    console.error('❌ Cloudinary upload error:', err.message);
    return { 
      url: 'https://placehold.co/400x300?text=Upload+Failed', 
      publicId: null 
    };
  }
};

module.exports = { uploadPhotoFromMeta };
