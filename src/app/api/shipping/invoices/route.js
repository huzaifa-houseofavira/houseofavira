import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/shipping/invoices?batch_id=&invoice_status=&payment_status=
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const batchId = searchParams.get('batch_id');
    const invoiceStatus = searchParams.get('invoice_status');
    const paymentStatus = searchParams.get('payment_status');

    let query = adminDb.collection('shipping_invoices');

    // Apply filters as composable Firestore where() clauses
    if (batchId) {
      query = query.where('batch_id', '==', batchId);
    }
    if (invoiceStatus) {
      query = query.where('invoice_status', '==', invoiceStatus);
    }
    if (paymentStatus) {
      query = query.where('payment_status', '==', paymentStatus);
    }

    query = query.orderBy('created_at', 'desc');

    const snapshot = await query.get();

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { invoices },
      { headers: { 'Cache-Control': 'private, no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error fetching shipping invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping invoices', details: error.message },
      { status: 500 }
    );
  }
}
