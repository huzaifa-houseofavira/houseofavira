import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60; // Allow more time for Cloudinary uploads

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const isManualCrop = formData.get('manualCrop') === 'true';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadOptions = {
      folder: 'house-of-avira/products',
      format: 'webp',
      quality: 'auto',
    };

    if (!isManualCrop) {
      uploadOptions.aspect_ratio = '3:4';
      uploadOptions.crop = 'fill';
      uploadOptions.gravity = 'auto';
      uploadOptions.width = 900;
      uploadOptions.height = 1200;
    } else {
      uploadOptions.crop = 'limit';
      uploadOptions.width = 1600;
      uploadOptions.height = 1600;
    }

    const url = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Cloudinary upload API error:", error);
    const errorMsg = error.message || error.error?.message || JSON.stringify(error) || String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
