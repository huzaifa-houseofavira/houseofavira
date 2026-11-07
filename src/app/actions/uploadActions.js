'use server';

import { adminBucket, BUCKET_NAME } from '@/lib/firebase-admin';

/**
 * Upload a single image to Firebase Storage.
 * @param {FormData} formData - Must contain a single 'image' file.
 */
export async function uploadSingleImage(formData) {
  try {
    const file = formData.get('image');
    if (!file) throw new Error("No image provided");

    if (!adminBucket) {
      throw new Error("Firebase Storage bucket is not available");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || 'image.webp';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'webp';
    const contentType = file.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg');

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `products/${timestamp}_${random}.${ext}`;

    const fileRef = adminBucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    try {
      await fileRef.makePublic();
    } catch (pubErr) {
      console.warn("makePublic warning:", pubErr.message);
    }

    const url = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

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
      if (!adminBucket) return { success: true };
      const urlPath = new URL(imageUrl).pathname;
      // Path format: /bucket-name/products/filename.webp
      const filePath = urlPath.split('/').slice(2).join('/');
      try {
        await adminBucket.file(filePath).delete();
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

    if (!adminBucket) {
      throw new Error("Firebase Storage bucket is not available");
    }

    const urls = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalName = file.name || 'review.webp';
      const ext = originalName.split('.').pop()?.toLowerCase() || 'webp';
      const contentType = file.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg');

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const filename = `reviews/${timestamp}_${random}.${ext}`;

      const fileRef = adminBucket.file(filename);

      await fileRef.save(buffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        },
      });

      try {
        await fileRef.makePublic();
      } catch (pubErr) {
        console.warn("makePublic warning:", pubErr.message);
      }

      const url = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
      urls.push(url);
    }

    return { success: true, urls };
  } catch (error) {
    console.error("Firebase Storage review upload error:", error);
    return { success: false, error: error.message };
  }
}
