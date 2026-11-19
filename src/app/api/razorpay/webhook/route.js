import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { PRODUCT_PAYMENT_STATUS, INVOICE_PAYMENT_STATUS, ORDER_STATUS } from '@/lib/shipping-constants';
// Note: Uncomment or import email service here when ready to send receipts
// import { sendPaymentReceipt } from '@/lib/email-service';

export async function POST(request) {
  try {
    // 1. Get raw body for webhook verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json(
        { success: false, message: 'Invalid configuration or missing signature' },
        { status: 400 }
      );
    }

    // 2. Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay Webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 3. Parse verified body
    const event = JSON.parse(rawBody);

    // 4. Handle events
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!adminDb) {
        throw new Error('Database not connected.');
      }

      // Find order by razorpay_order_id
      const ordersRef = adminDb.collection('orders');
      const snapshot = await ordersRef.where('razorpay_order_id', '==', razorpayOrderId).get();

      if (snapshot.empty) {
        console.warn(`Webhook: Order with razorpay_order_id ${razorpayOrderId} not found.`);
        return NextResponse.json({ success: true, message: 'Order not found, but webhook received.' });
      }

      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data();
      const isAlreadyConfirmed = orderData.product_payment_status === PRODUCT_PAYMENT_STATUS.CONFIRMED;

      if (!isAlreadyConfirmed) {
        // Extract payment details for receipt
        const paymentDetails = {
          method: paymentEntity.method,
          bank: paymentEntity.bank || null,
          wallet: paymentEntity.wallet || null,
          vpa: paymentEntity.vpa || null,
          card_last4: paymentEntity.card ? paymentEntity.card.last4 : null,
          card_network: paymentEntity.card ? paymentEntity.card.network : null,
          amount: paymentEntity.amount / 100, // stored in paise, convert to INR
        };

        await orderDoc.ref.update({
          order_status: ORDER_STATUS.PRODUCT_PAID,
          product_payment_status: PRODUCT_PAYMENT_STATUS.CONFIRMED,
          razorpay_payment_id: razorpayPaymentId,
          payment_details: paymentDetails,
          updated_at: new Date().toISOString(),
        });

        console.log(`Webhook: Order ${orderDoc.id} confirmed via payment.captured`);
      } else {
        console.log(`Webhook: Order ${orderDoc.id} already confirmed.`);
      }

      // ── Send Confirmation Email if not already sent ──
      if (!orderData.confirmation_email_sent) {
        try {
          const { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } = await import('@/lib/email-service');
          const currencySymbol = '₹';
          
          await sendOrderConfirmationEmail({
            customerEmail: orderData.customer_email,
            customerName: orderData.customer_name,
            orderId: orderDoc.id,
            items: orderData.items,
            payableAmount: orderData.payable_amount,
            shippingAddress: orderData.shipping_address,
            currencySymbol
          });
          
          await sendAdminOrderNotificationEmail({
            orderId: orderDoc.id,
            customerName: orderData.customer_name,
            customerEmail: orderData.customer_email,
            customerPhone: orderData.customer_phone || (orderData.shipping_address && orderData.shipping_address.phone),
            items: orderData.items,
            itemsCount: orderData.items_count,
            payableAmount: orderData.payable_amount,
            currencySymbol,
            shippingAddress: orderData.shipping_address
          });

          await orderDoc.ref.update({
            confirmation_email_sent: true,
            confirmation_email_sent_at: new Date().toISOString(),
          });
          console.log(`Webhook: Successfully sent confirmation email for ${orderDoc.id}`);
        } catch (emailErr) {
          console.error(`Webhook: Failed to send order emails for ${orderDoc.id}:`, emailErr);
          await orderDoc.ref.update({
            confirmation_email_sent: false,
            confirmation_email_error: emailErr.message || 'Unknown email error',
          });
        }
      }

    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      
      const ordersRef = adminDb.collection('orders');
      const snapshot = await ordersRef.where('razorpay_order_id', '==', razorpayOrderId).get();
      
      if (!snapshot.empty) {
        const orderDoc = snapshot.docs[0];
        // We only want to log or mark failed if it's currently pending
        if (orderDoc.data().product_payment_status === PRODUCT_PAYMENT_STATUS.PENDING) {
          await orderDoc.ref.update({
             // We can use FAILED if it exists, otherwise keep it PENDING but update attempts
            product_payment_status: PRODUCT_PAYMENT_STATUS.FAILED || 'FAILED', 
            updated_at: new Date().toISOString(),
          });
          console.log(`Webhook: Order ${orderDoc.id} marked as failed via payment.failed`);
        }
      }
    } else if (event.event === 'payment_link.paid') {
      const paymentLinkEntity = event.payload.payment_link.entity;
      const razorpayPaymentLinkId = paymentLinkEntity.id;
      
      const invoicesRef = adminDb.collection('shipping_invoices');
      const snapshot = await invoicesRef.where('payment_link_id', '==', razorpayPaymentLinkId).get();
      
      if (!snapshot.empty) {
        const invoiceDoc = snapshot.docs[0];
        const invoiceData = invoiceDoc.data();
        
        if (invoiceData.payment_status !== INVOICE_PAYMENT_STATUS.PAID) {
          const now = new Date().toISOString();
          const writeBatch = adminDb.batch();
          
          writeBatch.update(invoiceDoc.ref, {
            payment_status: INVOICE_PAYMENT_STATUS.PAID,
            amount_paid: paymentLinkEntity.amount_paid / 100,
            paid_at: now,
            updated_at: now,
          });
          
          if (invoiceData.order_id) {
            const orderRef = adminDb.collection('orders').doc(invoiceData.order_id);
            writeBatch.update(orderRef, {
              order_status: ORDER_STATUS.PROCESSING_DISPATCH,
              updated_at: now,
            });
          }
          
          await writeBatch.commit();
          console.log(`Webhook: Shipping Invoice ${invoiceDoc.id} marked as PAID via payment_link.paid`);
        } else {
          console.log(`Webhook: Shipping Invoice ${invoiceDoc.id} already marked as PAID, skipping update.`);
        }
      } else {
        console.warn(`Webhook: Invoice with payment_link_id ${razorpayPaymentLinkId} not found.`);
      }
    }

    // Always return 200 OK to Razorpay so it doesn't retry
    return NextResponse.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 even on some internal errors if we don't want Razorpay to retry endlessly,
    // but 500 will make it retry. Let's return 500 for actual unhandled exceptions so it retries.
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
