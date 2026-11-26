import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Fetch collection by slug
    const colSnapshot = await adminDb.collection('collections')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (colSnapshot.empty) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const colDoc = colSnapshot.docs[0];
    const colData = colDoc.data();
    const collectionInfo = {
      id: colDoc.id,
      title: colData.title || '',
      slug: colData.slug || '',
      description: colData.description || '',
      productIds: colData.productIds || [],
    };

    // Fetch all products by their IDs
    const productIds = collectionInfo.productIds;
    let products = [];

    if (productIds.length > 0) {
      const fetchPromises = productIds.map(id =>
        adminDb.collection('products').doc(id).get()
      );
      const snapshots = await Promise.all(fetchPromises);

      products = snapshots
        .filter(doc => doc.exists)
        .map(doc => {
          const data = doc.data();
          // Deep serialize to strip Firebase-specific prototypes
          const safeData = {};
          for (const key in data) {
            if (data[key] && typeof data[key].toDate === 'function') {
              safeData[key] = data[key].toDate().toISOString();
            } else {
              safeData[key] = data[key];
            }
          }
          return JSON.parse(JSON.stringify({ id: doc.id, ...safeData }));
        });
    }

    return NextResponse.json(
      { collection: collectionInfo, products },
      {
        headers: {
          'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/collections/[slug] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
