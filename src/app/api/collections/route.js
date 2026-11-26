import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }
    const snapshot = await adminDb.collection('collections').get();
    const collections = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        productIds: data.productIds || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
    collections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(collections, {
      headers: {
        'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('GET /api/collections error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }
    const body = await request.json();
    const { title, slug, description, productIds } = body;

    if (!title || !slug || !productIds || productIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ref = await adminDb.collection('collections').add({
      title,
      slug,
      description: description || '',
      productIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/collections error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }
    const body = await request.json();
    const { id, title, slug, description, productIds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    await adminDb.collection('collections').doc(id).update({
      title,
      slug,
      description: description || '',
      productIds,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/collections error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    await adminDb.collection('collections').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/collections error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
