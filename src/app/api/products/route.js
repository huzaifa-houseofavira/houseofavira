import { adminDb } from '@/lib/firebase-admin';

// In-memory cache with TTL
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const maxItems = parseInt(searchParams.get('limit') || '1000', 10);

  const now = Date.now();

  // Return cached data if fresh
  if (productsCache && (now - cacheTimestamp) < CACHE_TTL) {
    const sliced = productsCache.slice(0, maxItems);
    return Response.json(sliced, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // If cache exists but is stale, still serve it on error
    if (productsCache) {
      return Response.json(productsCache.slice(0, maxItems), {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }
    return Response.json([], { status: 500 });
  }
}
