import { adminDb } from '@/lib/firebase-admin';

// In-memory cache for banners
let bannersCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (bannersCache && (now - cacheTimestamp) < CACHE_TTL) {
    return Response.json(bannersCache, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  }

  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const snapshot = await adminDb.collection('mobile_banners').get();
    let banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || doc.data().createdAt || null,
    }));

    // Sort by order field if it exists, otherwise by createdAt desc
    banners.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Update cache
    bannersCache = banners;
    cacheTimestamp = now;

    return Response.json(banners, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    if (bannersCache) {
      return Response.json(bannersCache, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }
    return Response.json([], { status: 500 });
  }
}
