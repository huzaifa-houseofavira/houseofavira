import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

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
  return getStorage(getAdminApp()).bucket();
}

export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const isManualCrop = formData.get('manualCrop') === 'true';
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    let sharpInstance = sharp(buffer);

    if (!isManualCrop) {
      sharpInstance = sharpInstance
        .resize(900, 1200, { fit: 'cover', position: 'attention' });
    } else {
      sharpInstance = sharpInstance
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
    }

    buffer = await sharpInstance
      .webp({ quality: 80 })
      .toBuffer();

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

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Firebase Storage upload API error:", error);
    const errorMsg = error.message || String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
