import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  try {
    let pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    pk = pk.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: pk,
      }),
    });

    const db = getFirestore(app);
    db.settings({ ignoreUndefinedProperties: true });
    return db;
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    return null;
  }
}

export const adminDb = initAdmin();
