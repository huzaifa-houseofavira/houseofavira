import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  ORDER_STATUS,
  WEIGHT_STATUS,
  PRODUCT_PAYMENT_STATUS,
} from '@/lib/shipping-constants';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const filter = searchParams.get('filter');

    let orders = [];

    if (filter === 'weight_pending') {
      // Orders where product payment is confirmed, weight not yet entered
      // Firestore query for equality fields, then filter out CANCELLED in-memory
      const snapshot = await adminDb
        .collection('orders')
        .where('product_payment_status', '==', PRODUCT_PAYMENT_STATUS.CONFIRMED)
        .where('weight_status', '==', WEIGHT_STATUS.PENDING)
        .get();

      orders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.order_status !== ORDER_STATUS.CANCELLED);
    } else if (filter === 'ready_for_batch') {
      // Orders with weight entered, not yet in a batch, payment confirmed
      // We query by order_status == WEIGHT_ENTERED, since batching changes it to IN_BATCH.
      const snapshot = await adminDb
        .collection('orders')
        .where('order_status', '==', ORDER_STATUS.WEIGHT_ENTERED)
        .where('product_payment_status', '==', PRODUCT_PAYMENT_STATUS.CONFIRMED)
        .get();

      orders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.order_status !== ORDER_STATUS.CANCELLED);
    } else {
      // No filter — return all orders (most-recent first by created_at)
      const snapshot = await adminDb
        .collection('orders')
        .orderBy('created_at', 'desc')
        .get();

      orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching shipping orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
