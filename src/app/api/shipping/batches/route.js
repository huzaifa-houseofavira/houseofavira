import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { BATCH_STATUS, generateBatchName } from '@/lib/shipping-constants';

// ── GET /api/shipping/batches — List all shipment batches ──
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const snapshot = await adminDb
      .collection('shipment_batches')
      .orderBy('created_at', 'desc')
      .get();

    const batches = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { batches },
      { headers: { 'Cache-Control': 'private, no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// ── POST /api/shipping/batches — Create a new shipment batch ──
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { batch_name, notes } = body || {};

    const now = new Date().toISOString();

    const batchData = {
      batch_name: batch_name || generateBatchName(),
      notes: notes || '',
      status: BATCH_STATUS.OPEN,

      // Cost fields
      final_total_shipment_cost: null,
      estimated_total_weight: null,
      actual_total_shipment_weight: null,

      // Counts
      total_orders_count: 0,
      total_customers_count: 0,

      // Linked orders
      order_ids: [],

      // Timestamps
      created_at: now,
      updated_at: now,
      allocation_generated_at: null,
      invoices_generated_at: null,
    };

    const docRef = await adminDb.collection('shipment_batches').add(batchData);

    return NextResponse.json(
      {
        batch: {
          id: docRef.id,
          ...batchData,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
