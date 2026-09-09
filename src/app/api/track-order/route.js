import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request) {
  try {
    const rawBody = await request.json();
    let orderId = sanitizeString(rawBody.orderId, 50);
    let contact = sanitizeString(rawBody.contact, 100);

    if (!orderId || !contact) {
      return NextResponse.json({ error: 'Order ID and Contact info are required.' }, { status: 400 });
    }
    
    // Normalize orderId (remove # and spaces) for robust searching
    const cleanId = orderId.replace(/[\s#]/g, '').toUpperCase();
    
    // Generate possible ID combinations to make search super logical
    // (e.g. searching 'hor31' should match 'HOR-031' or 'HOA031')
    let possibleIds = [cleanId];
    
    const match = cleanId.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = match[2];
      const paddedNum = num.padStart(3, '0');
      
      possibleIds = [
        `${prefix}-${paddedNum}`, // e.g. HOR-031
        `${prefix}${paddedNum}`,  // e.g. HOR031
        `${prefix}-${num}`,       // e.g. HOR-31
        `${prefix}${num}`,        // e.g. HOR31
        cleanId
      ];
    }

    let orderDoc = null;
    for (const pid of possibleIds) {
      const doc = await adminDb.collection('orders').doc(pid).get();
      if (doc.exists) {
        orderDoc = doc;
        break;
      }
    }

    if (!orderDoc) {
      return NextResponse.json({ error: 'Order not found. Please verify your Order ID.' }, { status: 404 });
    }

    const data = orderDoc.data();

    // Verify contact matches customer_email or customer_phone
    const isEmailMatch = data.customer_email && data.customer_email.toLowerCase() === contact.toLowerCase();
    const dataPhone = data.customer_phone ? data.customer_phone.replace(/[^0-9]/g, '') : '';
    const contactPhone = contact ? contact.replace(/[^0-9]/g, '') : '';
    const isPhoneMatch = dataPhone && contactPhone && (dataPhone.endsWith(contactPhone) || contactPhone.endsWith(dataPhone));

    if (!isEmailMatch && !isPhoneMatch) {
      return NextResponse.json({ error: 'Contact information does not match the order records.' }, { status: 403 });
    }

    // Map to tracking page schema
    const orderData = {
      orderId: orderDoc.id,
      status: data.order_status || 'Pending',
      createdAt: data.created_at,
      customerInfo: {
        name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone || '',
      },
      shippingAddress: {
        addressLine1: data.shipping_address?.addressLine1 || data.shipping_address?.address || data.shipping_address?.line1 || '',
        city: data.shipping_address?.city || '',
        state: data.shipping_address?.state || '',
        pincode: data.shipping_address?.zip || data.shipping_address?.postal_code || data.shipping_address?.pincode || '',
      },
      paymentMethod: data.payment_method || 'Online',
      shippingFee: data.shipping_cost || 0,
      weightStatus: data.weight_status || 'PENDING',
      estimatedOrderWeight: data.estimated_order_weight || 0,
      finalTotal: data.payable_amount || data.total_amount,
      items: data.items.map(item => ({
        name: item.name || item.title || 'Unknown Item',
        size: item.size || item.selectedSize || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      }))
    };

    return NextResponse.json({ success: true, order: orderData });

  } catch (error) {
    console.error('Track Order API Error:', error);
    return NextResponse.json(
      { error: 'Server error while tracking order.' },
      { status: 500 }
    );
  }
}
