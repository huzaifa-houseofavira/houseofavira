import { adminDb } from '@/lib/firebase-admin';

// In-memory cache with TTL
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const maxItems = parseInt(searchParams.get('limit') || '1000', 10);
  const noCache = searchParams.get('nocache') === 'true' || searchParams.has('_t');

  const cacheHeader = noCache
    ? 'private, no-store, no-cache, must-revalidate'
    : 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

  const now = Date.now();

  // Return cached data if fresh
  if (!noCache && productsCache && (now - cacheTimestamp) < CACHE_TTL) {
    const sliced = productsCache.slice(0, maxItems);
    return Response.json(sliced, {
      headers: {
        'Cache-Control': cacheHeader,
      },
    });
  }

  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const snapshot = await adminDb
      .collection('products')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();

    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null,
      };
    });

    // Update cache
    productsCache = products;
    cacheTimestamp = now;

    const sliced = products.slice(0, maxItems);
    return Response.json(sliced, {
      headers: {
        'Cache-Control': cacheHeader,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // If cache exists but is stale, still serve it on error
    if (productsCache) {
      return Response.json(productsCache.slice(0, maxItems), {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }
    return Response.json([], { status: 500 });
  }
}
