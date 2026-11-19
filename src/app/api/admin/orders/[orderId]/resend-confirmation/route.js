import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email-service';

export async function POST(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Database not initialized.' }, { status: 500 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const orderData = orderDoc.data();

    if (!orderData.customer_email) {
      return NextResponse.json({ success: false, message: 'Order has no customer email.' }, { status: 400 });
    }

    const currencySymbol = '₹';

    // 1. Send customer confirmation email
    await sendOrderConfirmationEmail({
      customerEmail: orderData.customer_email,
      customerName: orderData.customer_name,
      orderId: orderDoc.id,
      items: orderData.items,
      payableAmount: orderData.payable_amount,
      shippingAddress: orderData.shipping_address,
      currencySymbol,
    });

    // 2. Also send/resend admin notification
    try {
      await sendAdminOrderNotificationEmail({
        orderId: orderDoc.id,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone || (orderData.shipping_address && orderData.shipping_address.phone),
        items: orderData.items,
        itemsCount: orderData.items_count,
        payableAmount: orderData.payable_amount,
        currencySymbol,
        shippingAddress: orderData.shipping_address,
      });
    } catch (adminErr) {
      console.warn('Admin notification email failed during resend:', adminErr.message);
    }

    // 3. Update order in Firestore
    const now = new Date().toISOString();
    await orderRef.update({
      confirmation_email_sent: true,
      confirmation_email_sent_at: now,
      confirmation_email_resent_at: now,
    });

    return NextResponse.json({
      success: true,
      message: `Confirmation email sent successfully to ${orderData.customer_email}`,
    });
  } catch (error) {
    console.error('Failed to resend confirmation email:', error);
    return NextResponse.json({
      success: false,
      code: error.code || 'UNKNOWN',
      message: error.message || 'Failed to send confirmation email',
    }, { status: 500 });
  }
}
