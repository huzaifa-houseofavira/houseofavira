import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { BATCH_STATUS, ORDER_STATUS } from '@/lib/shipping-constants';
import { FieldValue } from 'firebase-admin/firestore';

// ── GET /api/shipping/batches/[batchId] — Fetch batch with orders and allocations ──
export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { batchId } = await params;

    // Fetch batch document
    const batchDoc = await adminDb
      .collection('shipment_batches')
      .doc(batchId)
      .get();

    if (!batchDoc.exists) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const batch = { id: batchDoc.id, ...batchDoc.data() };

    // Fetch orders linked to this batch
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('batch_id', '==', batchId)
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch allocations for this batch
    const allocationsSnapshot = await adminDb
      .collection('batch_allocations')
      .where('batch_id', '==', batchId)
      .get();

    const allocations = allocationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { batch, orders, allocations },
      { headers: { 'Cache-Control': 'private, no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}

// ── PATCH /api/shipping/batches/[batchId] — Update batch fields ──
export async function PATCH(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { batchId } = await params;
    const body = await request.json();

    const batchRef = adminDb.collection('shipment_batches').doc(batchId);
    const batchDoc = await batchRef.get();

    if (!batchDoc.exists) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const currentBatch = batchDoc.data();
    const updateData = { updated_at: new Date().toISOString() };

    // Allowed updatable fields
    if (body.batch_name !== undefined) {
      updateData.batch_name = body.batch_name;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.actual_total_shipment_weight !== undefined) {
      updateData.actual_total_shipment_weight =
        body.actual_total_shipment_weight;
    }

    // Handle final_total_shipment_cost with status transition
    if (body.final_total_shipment_cost !== undefined) {
      updateData.final_total_shipment_cost = body.final_total_shipment_cost;

      if (
        currentBatch.status === BATCH_STATUS.OPEN ||
        currentBatch.status === BATCH_STATUS.WAITING_FINAL_COST
      ) {
        updateData.status = BATCH_STATUS.WAITING_FINAL_COST;
      }
    }

    await batchRef.update(updateData);

    const updatedDoc = await batchRef.get();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/shipping/batches/[batchId] — Delete batch if OPEN and no invoices ──
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { batchId } = await params;

    const batchRef = adminDb.collection('shipment_batches').doc(batchId);
    const batchDoc = await batchRef.get();

    if (!batchDoc.exists) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const batchData = batchDoc.data();

    // Remove batch_id from all linked orders and reset their status
    const orderIds = batchData.order_ids || [];
    const batchWrite = adminDb.batch();

    for (const orderId of orderIds) {
      const orderRef = adminDb.collection('orders').doc(orderId);
      batchWrite.update(orderRef, {
        batch_id: null,
        shipping_invoice_id: FieldValue.delete(),
        shipping_payment_link: FieldValue.delete(),
        shipping_amount_due: FieldValue.delete(),
        order_status: ORDER_STATUS.WEIGHT_ENTERED,
        updated_at: new Date().toISOString(),
      });
    }

    // Delete any invoices for this batch
    const invoicesSnapshot = await adminDb
      .collection('shipping_invoices')
      .where('batch_id', '==', batchId)
      .get();
    
    for (const invoiceDoc of invoicesSnapshot.docs) {
      batchWrite.delete(invoiceDoc.ref);
    }



    // Delete any allocations for this batch
    const allocationsSnapshot = await adminDb
      .collection('batch_allocations')
      .where('batch_id', '==', batchId)
      .get();

    for (const allocDoc of allocationsSnapshot.docs) {
      batchWrite.delete(allocDoc.ref);
    }

    // Delete the batch document
    batchWrite.delete(batchRef);

    await batchWrite.commit();

    return NextResponse.json({ success: true, deleted: batchId });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  }
}
