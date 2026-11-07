import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const BUCKET_NAME = 'houseofavirabyshamhitha.firebasestorage.app';

function initAdmin() {
  let app;
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    try {
      let pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
      pk = pk.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: pk,
        }),
        storageBucket: BUCKET_NAME,
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error.message);
      return { db: null, bucket: null };
    }
  }

  try {
    const db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch (sErr) {
      // Ignore if settings already applied
    }
    const bucket = getStorage(app).bucket(BUCKET_NAME);
    return { db, bucket };
  } catch (err) {
    console.error('Firebase Admin services initialization error:', err.message);
    return { db: null, bucket: null };
  }
}

const { db: adminDb, bucket: adminBucket } = initAdmin();
export { adminDb, adminBucket };
