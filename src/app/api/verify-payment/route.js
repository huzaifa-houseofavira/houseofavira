import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { PRODUCT_PAYMENT_STATUS, ORDER_STATUS } from '@/lib/shipping-constants';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification fields.' },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature.' },
        { status: 400 }
      );
    }

    // Update Firestore order status
    if (!adminDb) {
      throw new Error('Database not connected.');
    }

    const orderRef = adminDb.collection('orders').doc(db_order_id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    if (orderDoc.data().razorpay_order_id && orderDoc.data().razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, message: 'Security verification failed: Order mismatch.' },
        { status: 403 }
      );
    }

    if (orderDoc.data().product_payment_status === PRODUCT_PAYMENT_STATUS.CONFIRMED) {
      // Idempotency: Already confirmed, possibly by webhook
      return NextResponse.json({ success: true, message: 'Payment verified successfully.' });
    }

    await orderRef.update({
      order_status: ORDER_STATUS.PRODUCT_PAID,
      product_payment_status: PRODUCT_PAYMENT_STATUS.CONFIRMED,
      razorpay_order_id,
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    });

    // ── Send Emails ──
    try {
      const orderData = orderDoc.data();
      const { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } = await import('@/lib/email-service');
      const currencySymbol = '₹';
      
      // Send to customer
      await sendOrderConfirmationEmail({
        customerEmail: orderData.customer_email,
        customerName: orderData.customer_name,
        orderId: db_order_id,
        items: orderData.items,
        payableAmount: orderData.payable_amount,
        shippingAddress: orderData.shipping_address,
        currencySymbol
      });
      
      // Send to admin
      await sendAdminOrderNotificationEmail({
        orderId: db_order_id,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone || (orderData.shipping_address && orderData.shipping_address.phone),
        items: orderData.items,
        itemsCount: orderData.items_count,
        payableAmount: orderData.payable_amount,
        currencySymbol,
        shippingAddress: orderData.shipping_address
      });

      await orderRef.update({
        confirmation_email_sent: true,
        confirmation_email_sent_at: new Date().toISOString(),
      });
    } catch (emailErr) {
      console.error('Failed to send order emails on payment verification:', emailErr);
      await orderRef.update({
        confirmation_email_sent: false,
        confirmation_email_error: emailErr.message || 'Unknown email error',
      });
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify payment. Details: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
