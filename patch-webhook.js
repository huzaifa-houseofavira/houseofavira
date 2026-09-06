const fs = require('fs');

const path = 'src/app/api/razorpay/webhook/route.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update imports
content = content.replace(
  "import { PRODUCT_PAYMENT_STATUS } from '@/lib/shipping-constants';",
  "import { PRODUCT_PAYMENT_STATUS, INVOICE_PAYMENT_STATUS, ORDER_STATUS } from '@/lib/shipping-constants';"
);

// 2. Add the payment_link.paid handler
const paymentLinkBlock = `
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
          console.log(\`Webhook: Shipping Invoice \${invoiceDoc.id} marked as PAID via payment_link.paid\`);
        } else {
          console.log(\`Webhook: Shipping Invoice \${invoiceDoc.id} already marked as PAID, skipping update.\`);
        }
      } else {
        console.warn(\`Webhook: Invoice with payment_link_id \${razorpayPaymentLinkId} not found.\`);
      }
    }
`;

content = content.replace(
  "    // Always return 200 OK to Razorpay so it doesn't retry",
  paymentLinkBlock + "\n    // Always return 200 OK to Razorpay so it doesn't retry"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Webhook updated successfully.');
