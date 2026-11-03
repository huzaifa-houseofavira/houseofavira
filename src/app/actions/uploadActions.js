'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

// ── Init Firebase Admin (reuse if already initialized) ──
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  let pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  pk = pk.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: pk,
    }),
    storageBucket: 'houseofavirabyshamhitha.firebasestorage.app',
  });
}

function getBucket() {
  const app = getAdminApp();
  return getStorage(app).bucket();
}

/**
 * Upload a single image to Firebase Storage.
 * @param {FormData} formData - Must contain a single 'image' file and optional 'manualCrop' boolean flag.
 */
export async function uploadSingleImage(formData) {
  try {
    const file = formData.get('image');
    if (!file) throw new Error("No image provided");

    const isManualCrop = formData.get('manualCrop') === 'true';

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Process with sharp: convert to webp, resize
    let sharpInstance = sharp(buffer);

    if (!isManualCrop) {
      // Auto crop to 3:4 with center gravity
      sharpInstance = sharpInstance
        .resize(900, 1200, { fit: 'cover', position: 'attention' });
    } else {
      // Manual crop - just limit dimensions
      sharpInstance = sharpInstance
        .resize(900, 1200, { fit: 'inside', withoutEnlargement: true });
    }

    buffer = await sharpInstance
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `products/${timestamp}_${random}.webp`;

    const bucket = getBucket();
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000',
      },
    });

    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return { success: true, url };
  } catch (error) {
    console.error("Firebase Storage upload error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload multiple images to Firebase Storage sequentially.
 * @deprecated Prefer uploadSingleImage for new code.
 */
export async function uploadImagesToCloudinary(formData) {
  try {
    const files = formData.getAll('images');
    if (!files || files.length === 0) {
      throw new Error("No images provided");
    }

    const urls = [];
    for (const file of files) {
      const singleForm = new FormData();
      singleForm.append('image', file);
      singleForm.append('manualCrop', 'false');
      const result = await uploadSingleImage(singleForm);
      if (!result.success) throw new Error(result.error || 'Upload failed');
      urls.push(result.url);
    }

    return { success: true, urls };

  } catch (error) {
    console.error("Firebase Storage upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteImageFromCloudinary(imageUrl) {
  try {
    if (!imageUrl) return { success: true };
    
    // Handle Firebase Storage URLs
    if (imageUrl.includes('storage.googleapis.com')) {
      const bucket = getBucket();
      const urlPath = new URL(imageUrl).pathname;
      // Path format: /bucket-name/products/filename.webp
      const filePath = urlPath.split('/').slice(2).join('/');
      try {
        await bucket.file(filePath).delete();
      } catch (e) {
        // File might not exist, that's okay
      }
      return { success: true };
    }

    // Old Cloudinary URLs - can't delete since account is banned, just return success
    if (imageUrl.includes('cloudinary.com')) {
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadReviewImagesToCloudinary(formData) {
  try {
    const files = formData.getAll('images');
    if (!files || files.length === 0) {
      return { success: true, urls: [] };
    }

    const urls = [];
    const bucket = getBucket();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);

      // Convert to webp
      buffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const filename = `reviews/${timestamp}_${random}.webp`;

      const fileRef = bucket.file(filename);

      await fileRef.save(buffer, {
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        },
      });

      await fileRef.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      urls.push(url);
    }

    return { success: true, urls };
  } catch (error) {
    console.error("Firebase Storage review upload error:", error);
    return { success: false, error: error.message };
  }
}
