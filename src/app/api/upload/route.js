import { NextResponse } from 'next/server';
import { adminBucket, BUCKET_NAME } from '@/lib/firebase-admin';

export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: "No valid image file provided" }, { status: 400 });
    }

    if (!adminBucket) {
      throw new Error("Firebase Storage bucket is not available");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ success: false, error: "Empty image buffer" }, { status: 400 });
    }

    // Determine extension & contentType
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
      console.warn("makePublic warning (may already be public or bucket-level policy):", pubErr.message);
    }

    const url = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Firebase Storage upload API error:", error);
    const errorMsg = error.message || String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
