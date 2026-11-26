import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  getCurrencyForCountry,
  INVOICE_STATUS,
  INVOICE_PAYMENT_STATUS,
  SHIPPING_PAYMENT_STATUS,
  ORDER_STATUS,
} from '@/lib/shipping-constants';
import { sendShippingPaymentReceivedEmail } from '@/lib/email-service';

// GET /api/shipping/invoices/[invoiceId]
export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { invoiceId } = await params;

    const invoiceDoc = await adminDb
      .collection('shipping_invoices')
      .doc(invoiceId)
      .get();

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        invoice: { id: invoiceDoc.id, ...invoiceDoc.data() },
      },
      { headers: { 'Cache-Control': 'private, no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/shipping/invoices/[invoiceId]
export async function PATCH(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { invoiceId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    const invoiceRef = adminDb.collection('shipping_invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceDoc.data();
    const now = new Date().toISOString();

    switch (action) {
      // ── Mark Paid ──
      case 'mark_paid': {
        // Update the invoice
        await invoiceRef.update({
          invoice_status: INVOICE_STATUS.PAID,
          payment_status: INVOICE_PAYMENT_STATUS.MANUAL_CONFIRMED,
          paid_at: now,
          updated_at: now,
        });

        // Update the linked order
        if (invoiceData.order_id) {
          const orderRef = adminDb.collection('orders').doc(invoiceData.order_id);
          const orderDoc = await orderRef.get();

          if (orderDoc.exists) {
            await orderRef.update({
              shipping_payment_status: SHIPPING_PAYMENT_STATUS.PAID,
              order_status: ORDER_STATUS.SHIPPING_PAID,
              updated_at: now,
            });

            // Send payment received email
            const orderData = orderDoc.data();
            const currency = getCurrencyForCountry(orderData.customer_country);

            try {
              await sendShippingPaymentReceivedEmail({
                customerEmail: orderData.customer_email,
                customerName: orderData.customer_name || orderData.customer_email,
                orderId: invoiceData.order_id,
                amount: invoiceData.amount,
                currencySymbol: currency.symbol,
              });
            } catch (emailError) {
              console.error('Failed to send payment received email:', emailError);
              // Don't fail the request if email fails — payment is already recorded
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Invoice marked as paid',
        });
      }

      // ── Mark Overdue ──
      case 'mark_overdue': {
        await invoiceRef.update({
          invoice_status: INVOICE_STATUS.OVERDUE,
          updated_at: now,
        });

        return NextResponse.json({
          success: true,
          message: 'Invoice marked as overdue',
        });
      }

      // ── Update Due Date ──
      case 'update_due_date': {
        const { due_date } = body;

        if (!due_date) {
          return NextResponse.json(
            { error: 'Missing required field: due_date' },
            { status: 400 }
          );
        }

        await invoiceRef.update({
          due_date,
          updated_at: now,
        });

        return NextResponse.json({
          success: true,
          message: 'Invoice due date updated',
        });
      }

      // ── Cancel ──
      case 'cancel': {
        // Only allow cancellation if invoice is not yet paid
        if (invoiceData.payment_status !== INVOICE_PAYMENT_STATUS.NOT_PAID) {
          return NextResponse.json(
            {
              error: 'Cannot cancel a paid invoice. Only unpaid invoices can be cancelled.',
            },
            { status: 400 }
          );
        }

        await invoiceRef.update({
          invoice_status: INVOICE_STATUS.CANCELLED,
          updated_at: now,
        });

        return NextResponse.json({
          success: true,
          message: 'Invoice cancelled',
        });
      }

      default: {
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Supported actions: mark_paid, mark_overdue, update_due_date, cancel`,
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/shipping/invoices/[invoiceId]
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { invoiceId } = await params;
    const invoiceRef = adminDb.collection('shipping_invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceDoc.data();
    
    // Check if paid
    if (invoiceData.payment_status !== INVOICE_PAYMENT_STATUS.NOT_PAID) {
      return NextResponse.json(
        { error: 'Cannot delete a paid invoice.' },
        { status: 400 }
      );
    }

    const batchWrite = adminDb.batch();

    // 1. Reset the linked order
    if (invoiceData.order_id) {
      const orderRef = adminDb.collection('orders').doc(invoiceData.order_id);
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        batchWrite.update(orderRef, {
          shipping_invoice_id: require('firebase-admin/firestore').FieldValue.delete(),
          shipping_payment_link: require('firebase-admin/firestore').FieldValue.delete(),
          shipping_amount_due: require('firebase-admin/firestore').FieldValue.delete(),
          order_status: ORDER_STATUS.IN_BATCH,
          updated_at: new Date().toISOString(),
        });
      }
    }

    // 2. Delete the invoice
    batchWrite.delete(invoiceRef);

    await batchWrite.commit();

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice', details: error.message },
      { status: 500 }
    );
  }
}
