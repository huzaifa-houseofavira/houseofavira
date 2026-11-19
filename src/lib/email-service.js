// ─── Email Service — Reusable Nodemailer Abstraction ───
// Handles all shipping-related and order email templates and sending

import nodemailer from 'nodemailer';

function createTransporter() {
  const user = (process.env.EMAIL_USER || 'houseofaviraorders@gmail.com')
    .trim()
    .replace(/^["']|["']$/g, '');

  let pass = (process.env.EMAIL_PASS || '')
    .trim()
    .replace(/^["']|["']$/g, '');

  // Google App Passwords are 16 letters (often generated as 4 groups of 4 letters with spaces).
  // Normalizing by stripping spaces ensures exact match.
  const cleanPass = pass.replace(/\s+/g, '');
  if (cleanPass.length === 16) {
    pass = cleanPass;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

const BRAND = {
  name: 'House of Avira',
  email: (process.env.EMAIL_USER || 'houseofaviraorders@gmail.com').trim().replace(/^["']|["']$/g, ''),
  website: 'https://houseofavira.shop',
  year: new Date().getFullYear(),
};

// ── Shared HTML wrapper ──
function wrapHtml(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      </style>
    </head>
    <body style="font-family: 'DM Sans', Arial, sans-serif; background-color: #f9f9f9; padding: 40px 0; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; padding: 48px 40px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        
        <div style="text-align: center; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0;">
          <h1 style="font-size: 18px; font-weight: 700; color: #000000; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
            HOUSE OF AVIRA
          </h1>
        </div>
        
        ${content}
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
          <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 0;">
            If you have any questions, simply reply to this email.<br>
            We're always here to help.
          </p>
          <p style="font-size: 11px; color: #bbbbbb; margin-top: 16px;">
            &copy; ${BRAND.year} House of Avira. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Shipping Invoice Email ──
export function generateShippingInvoiceHtml({ customerName, orderId, shippingAmount, dueDate, batchRef, currencySymbol = '₹', paymentLinkUrl }) {
  const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'As soon as possible';

  const content = `
    <h2 style="font-size: 22px; font-weight: 500; color: #000000; margin: 0 0 8px 0;">
      Hi ${customerName || 'there'},
    </h2>
    <p style="font-size: 14px; color: #666666; line-height: 1.7; margin: 0 0 28px 0;">
      Your shipment batch has been processed! Below is your shipping &amp; import cost for your order.
    </p>
    
    <div style="background-color: #fafafa; border-radius: 10px; padding: 24px; margin-bottom: 28px; border: 1px solid #f0f0f0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #888888; padding: 6px 0; font-weight: 500;">Order ID</td>
          <td style="color: #000000; text-align: right; padding: 6px 0; font-weight: 600;">${orderId}</td>
        </tr>
        ${batchRef ? `
        <tr>
          <td style="color: #888888; padding: 6px 0; font-weight: 500;">Batch Reference</td>
          <td style="color: #000000; text-align: right; padding: 6px 0; font-weight: 600;">${batchRef}</td>
        </tr>` : ''}
        <tr>
          <td style="color: #888888; padding: 6px 0; font-weight: 500;">Due Date</td>
          <td style="color: #000000; text-align: right; padding: 6px 0; font-weight: 600;">${dueDateStr}</td>
        </tr>
        <tr style="border-top: 2px solid #e8e8e8;">
          <td style="color: #000000; padding: 14px 0 6px 0; font-weight: 700; font-size: 15px;">Shipping Amount Due</td>
          <td style="color: #000000; text-align: right; padding: 14px 0 6px 0; font-weight: 800; font-size: 20px;">${currencySymbol}${shippingAmount}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f0f7ff; border-radius: 10px; padding: 18px 20px; margin-bottom: 28px; border: 1px solid #dbeafe;">
      <p style="font-size: 13px; color: #1e40af; line-height: 1.6; margin: 0;">
        <strong>Note:</strong> This is your second payment for this order. You have already paid the product price. 
        This shipping charge covers the international sourcing and import costs for your items.
      </p>
    </div>
    
    <div style="text-align: center; margin-bottom: 12px;">
      <a href="${paymentLinkUrl || BRAND.website}" 
         style="display: inline-block; background-color: #000000; color: #ffffff; padding: 16px 36px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px;">
        Pay Now
      </a>
    </div>
    
    <p style="font-size: 13px; color: #888888; text-align: center; line-height: 1.6; margin: 0;">
      Please complete this payment to proceed with shipping your order.
    </p>
  `;

  return wrapHtml(content);
}

// ── Shipping Payment Received Email ──
export function generatePaymentReceivedHtml({ customerName, orderId, amount, currencySymbol = '₹' }) {
  const content = `
    <h2 style="font-size: 22px; font-weight: 500; color: #000000; margin: 0 0 8px 0;">
      Hi ${customerName || 'there'},
    </h2>
    <p style="font-size: 14px; color: #666666; line-height: 1.7; margin: 0 0 28px 0;">
      We've received your shipping payment. Your order is now being prepared for dispatch!
    </p>
    
    <div style="background-color: #f0fdf4; border-radius: 10px; padding: 24px; margin-bottom: 28px; border: 1px solid #bbf7d0;">
      <div style="text-align: center;">
        <div style="font-size: 36px; margin-bottom: 8px;">✓</div>
        <p style="font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">
          Payment Confirmed
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; max-width: 280px; margin: 0 auto;">
          <tr>
            <td style="color: #15803d; padding: 4px 0; font-weight: 500;">Order ID</td>
            <td style="color: #15803d; text-align: right; padding: 4px 0; font-weight: 700;">${orderId}</td>
          </tr>
          <tr>
            <td style="color: #15803d; padding: 4px 0; font-weight: 500;">Amount Paid</td>
            <td style="color: #15803d; text-align: right; padding: 4px 0; font-weight: 700;">${currencySymbol}${amount}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #555555; line-height: 1.7; margin: 0;">
      We'll notify you with tracking details once your order has shipped. Thank you for shopping with House of Avira!
    </p>
  `;

  return wrapHtml(content);
}

// ── Order Confirmation Email (Customer) ──
export function generateOrderConfirmationHtml({ customerName, orderId, items = [], payableAmount = 0, shippingAddress = {}, currencySymbol = '₹' }) {
  const safeItems = Array.isArray(items) ? items : [];
  const itemsList = safeItems.map(item => {
    let size = item.size || item.selectedSize || '';
    let color = item.color || item.selectedColor || item.variant || item.colorName || '';
    if ((!size || !color) && item.cartItemId && typeof item.cartItemId === 'string') {
      const parts = item.cartItemId.split('-');
      if (parts.length >= 3) {
        if (!size && parts[1]) size = parts[1];
        if (!color && parts.slice(2).join('-')) color = parts.slice(2).join('-');
      }
    }
    return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 60px; vertical-align: top;">
              <img src="${item.image || 'https://via.placeholder.com/60?text=No+Image'}" alt="${item.name || item.title || 'Product Image'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <span style="font-weight: 600; color: #000000; display: block; margin-bottom: 4px;">${item.name || item.title || 'Unknown Item'}</span>
              ${size ? `<span style="font-size: 12px; color: #555555; display: block;">Size: ${size}</span>` : ''}
              ${color ? `<span style="font-size: 12px; color: #555555; display: block;">Color: ${color}</span>` : ''}
              <span style="font-size: 12px; color: #888888; display: block; margin-top: 4px;">Qty: ${item.quantity || 1}</span>
            </td>
          </tr>
        </table>
      </td>
      <td style="text-align: right; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 500; vertical-align: top;">
        ${currencySymbol}${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}
      </td>
    </tr>
  `;
  }).join('');

  const safeAddress = shippingAddress || {};
  const addrLine1 = safeAddress.addressLine1 || safeAddress.line1 || '';
  const addrLine2 = safeAddress.addressLine2 || safeAddress.line2 || '';
  const city = safeAddress.city || '';
  const state = safeAddress.state || '';
  const pincode = safeAddress.pincode || safeAddress.postalCode || '';
  const country = safeAddress.country || 'India';

  const addressFormatted = [
    addrLine1,
    addrLine2,
    [city, state, pincode].filter(Boolean).join(', '),
    country
  ].filter(Boolean).join('<br>') || 'Address on file';

  const content = `
    <h2 style="font-size: 22px; font-weight: 500; color: #000000; margin: 0 0 8px 0;">
      Hi ${customerName || 'Valued Customer'},
    </h2>
    <p style="font-size: 14px; color: #666666; line-height: 1.7; margin: 0 0 24px 0;">
      Thank you for your order! We've received it and are currently processing it.
      <br><strong>Order ID:</strong> ${orderId}
    </p>

    <div style="background-color: #fafafa; border-radius: 10px; padding: 20px; margin-bottom: 24px; border: 1px solid #f0f0f0;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 12px 0;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemsList}
        <tr>
          <td style="padding: 12px 0 0 0; font-weight: 700; color: #000000;">Total Paid (Product Only)</td>
          <td style="text-align: right; padding: 12px 0 0 0; font-weight: 700; font-size: 16px; color: #000000;">
            ${currencySymbol}${Number(payableAmount || 0).toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0f7ff; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #dbeafe;">
      <p style="font-size: 13px; color: #1e40af; line-height: 1.6; margin: 0;">
        <strong>Important:</strong> This payment was for the product only. Once your items are ready to be dispatched from our international warehouse, you will receive a second email with a link to pay the shipping & import costs.
      </p>
    </div>

    <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 8px 0;">Shipping Address</h3>
    <p style="font-size: 14px; color: #444444; line-height: 1.5; margin: 0;">
      ${addressFormatted}
    </p>
  `;

  return wrapHtml(content);
}

// ── Admin Order Notification Email ──
export function generateAdminNotificationHtml({ orderId, customerName, customerEmail, items = [], itemsCount, payableAmount = 0, currencySymbol = '₹', shippingAddress = {}, customerPhone }) {
  const safeItems = Array.isArray(items) ? items : [];
  const itemsList = safeItems.map(item => {
    let size = item.size || item.selectedSize || '';
    let color = item.color || item.selectedColor || item.variant || item.colorName || '';
    if ((!size || !color) && item.cartItemId && typeof item.cartItemId === 'string') {
      const parts = item.cartItemId.split('-');
      if (parts.length >= 3) {
        if (!size && parts[1]) size = parts[1];
        if (!color && parts.slice(2).join('-')) color = parts.slice(2).join('-');
      }
    }
    return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 60px; vertical-align: top;">
              <img src="${item.image || 'https://via.placeholder.com/60?text=No+Image'}" alt="${item.name || item.title || 'Product Image'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <span style="font-weight: 600; color: #000000; display: block; margin-bottom: 4px;">${item.name || item.title || 'Unknown Item'}</span>
              ${size ? `<span style="font-size: 12px; color: #555555; display: block;">Size: ${size}</span>` : ''}
              ${color ? `<span style="font-size: 12px; color: #555555; display: block;">Color: ${color}</span>` : ''}
              <span style="font-size: 12px; color: #888888; display: block; margin-top: 4px;">Qty: ${item.quantity || 1}</span>
            </td>
          </tr>
        </table>
      </td>
      <td style="text-align: right; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 500; vertical-align: top;">
        ${currencySymbol}${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}
      </td>
    </tr>
  `;
  }).join('');

  const safeAddress = shippingAddress || {};
  const addrLine1 = safeAddress.addressLine1 || safeAddress.line1 || '';
  const addrLine2 = safeAddress.addressLine2 || safeAddress.line2 || '';
  const city = safeAddress.city || '';
  const state = safeAddress.state || '';
  const pincode = safeAddress.pincode || safeAddress.postalCode || '';
  const country = safeAddress.country || 'India';
  const nameOnAddress = [safeAddress.firstName, safeAddress.lastName].filter(Boolean).join(' ');

  const addressHtml = (addrLine1 || city) ? `
    <tr>
      <td style="color: #888888; padding: 12px 0 6px 0; vertical-align: top;">Shipping Details</td>
      <td style="color: #000000; text-align: right; font-weight: 500; padding: 12px 0 6px 0;">
        ${nameOnAddress ? `${nameOnAddress}<br>` : ''}
        ${addrLine1 ? `${addrLine1}<br>` : ''}
        ${addrLine2 ? `${addrLine2}<br>` : ''}
        ${[city, state, pincode].filter(Boolean).join(', ')}<br>
        ${country}
      </td>
    </tr>
  ` : '';

  const effectivePhone = customerPhone || safeAddress.phone || '';
  const phoneHtml = effectivePhone ? `
    <tr>
      <td style="color: #888888; padding: 6px 0; border-bottom: 2px solid #e8e8e8;">Phone</td>
      <td style="color: #000000; text-align: right; font-weight: 600; border-bottom: 2px solid #e8e8e8;">${effectivePhone}</td>
    </tr>
  ` : '';

  const content = `
    <h2 style="font-size: 20px; font-weight: 500; color: #000000; margin: 0 0 16px 0;">
      New Order Received 🚀
    </h2>
    <div style="background-color: #fafafa; border-radius: 10px; padding: 20px; border: 1px solid #f0f0f0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #888888; padding: 6px 0;">Order ID</td>
          <td style="color: #000000; text-align: right; font-weight: 600;">${orderId}</td>
        </tr>
        <tr>
          <td style="color: #888888; padding: 6px 0;">Customer</td>
          <td style="color: #000000; text-align: right; font-weight: 600;">${customerName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #888888; padding: 6px 0; ${effectivePhone || addressHtml ? '' : 'border-bottom: 2px solid #e8e8e8;'}">Email</td>
          <td style="color: #000000; text-align: right; font-weight: 600; ${effectivePhone || addressHtml ? '' : 'border-bottom: 2px solid #e8e8e8;'}">${customerEmail || 'N/A'}</td>
        </tr>
        ${phoneHtml}
        ${addressHtml}
        <tr>
          <td colspan="2" style="border-bottom: 2px solid #e8e8e8; padding-top: 6px;"></td>
        </tr>
        ${itemsList}
        <tr style="border-top: 1px solid #e8e8e8;">
          <td style="color: #000000; padding: 12px 0 0 0; font-weight: 700;">Total Paid (Product Only)</td>
          <td style="color: #000000; text-align: right; padding: 12px 0 0 0; font-weight: 700;">${currencySymbol}${Number(payableAmount || 0).toLocaleString()}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${BRAND.website}/admin" 
         style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; border-radius: 6px;">
        View in Dashboard
      </a>
    </div>
  `;

  return wrapHtml(content);
}

// ── Send Email Functions ──
export async function sendShippingInvoiceEmail({ customerEmail, customerName, orderId, shippingAmount, dueDate, batchRef, currencySymbol, paymentLinkUrl }) {
  if (!customerEmail) {
    throw new Error(`sendShippingInvoiceEmail: No customer email provided for order ${orderId}`);
  }

  const transporter = createTransporter();
  const html = generateShippingInvoiceHtml({ customerName, orderId, shippingAmount, dueDate, batchRef, currencySymbol, paymentLinkUrl });

  const mailOptions = {
    from: `"House of Avira" <${BRAND.email}>`,
    to: customerEmail,
    subject: `Shipping Payment Due — Order ${orderId}`,
    html,
    text: `Hi ${customerName || 'there'},\n\nYour shipment batch has been processed. Your shipping amount due for Order ${orderId} is ${currencySymbol || '₹'}${shippingAmount}.\n\nThis is your second payment for this order — the shipping & import cost.\n\nDue date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'As soon as possible'}\n\nPlease visit ${paymentLinkUrl || BRAND.website} to complete your payment.\n\nThank you,\nThe House of Avira Team`,
    replyTo: BRAND.email,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[email-service] Shipping invoice email sent to ${customerEmail} for ${orderId}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

export async function sendShippingPaymentReceivedEmail({ customerEmail, customerName, orderId, amount, currencySymbol }) {
  if (!customerEmail) {
    throw new Error(`sendShippingPaymentReceivedEmail: No customer email provided for order ${orderId}`);
  }

  const transporter = createTransporter();
  const html = generatePaymentReceivedHtml({ customerName, orderId, amount, currencySymbol });

  const mailOptions = {
    from: `"House of Avira" <${BRAND.email}>`,
    to: customerEmail,
    subject: `Shipping Payment Received — Order ${orderId}`,
    html,
    text: `Hi ${customerName || 'there'},\n\nWe've received your shipping payment of ${currencySymbol || '₹'}${amount} for Order ${orderId}.\n\nYour order is now being prepared for dispatch. We'll notify you with tracking details once shipped.\n\nThank you for shopping with House of Avira!`,
    replyTo: BRAND.email,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[email-service] Shipping payment received email sent to ${customerEmail} for ${orderId}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

export async function sendOrderConfirmationEmail({ customerEmail, customerName, orderId, items, payableAmount, shippingAddress, currencySymbol }) {
  if (!customerEmail) {
    throw new Error(`sendOrderConfirmationEmail: No recipient email provided for order ${orderId}`);
  }

  const transporter = createTransporter();
  const html = generateOrderConfirmationHtml({ customerName, orderId, items, payableAmount, shippingAddress, currencySymbol });

  const mailOptions = {
    from: `"House of Avira" <${BRAND.email}>`,
    to: customerEmail,
    subject: `Order Confirmation — ${orderId}`,
    html,
    text: `Hi ${customerName || 'there'},\n\nThank you for your order!\nOrder ID: ${orderId}\nTotal Paid: ${currencySymbol || '₹'}${payableAmount}\n\nNote: This payment was for the product only. You will receive a second email for shipping costs later.\n\nThank you for shopping with House of Avira!`,
    replyTo: BRAND.email,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[email-service] Order confirmation email sent to ${customerEmail} for ${orderId}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

export async function sendAdminOrderNotificationEmail({ orderId, customerName, customerEmail, customerPhone, items, itemsCount, payableAmount, currencySymbol, shippingAddress }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'houseofavira@gmail.com';
  const transporter = createTransporter();
  const html = generateAdminNotificationHtml({ orderId, customerName, customerEmail, items, itemsCount, payableAmount, currencySymbol, shippingAddress, customerPhone });

  const mailOptions = {
    from: `"House of Avira" <${BRAND.email}>`,
    to: adminEmail,
    subject: `New Order Received — ${orderId}`,
    html,
    text: `New order ${orderId} received from ${customerName || 'Customer'} (${customerEmail || 'No email'}). Phone: ${customerPhone || (shippingAddress && shippingAddress.phone) || 'N/A'}. Items: ${itemsCount || (items?.length || 1)}. Amount: ${currencySymbol || '₹'}${payableAmount}.`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[email-service] Admin notification email sent to ${adminEmail} for ${orderId}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

// ── Email Config Diagnostic ──
export async function verifyEmailConfig() {
  try {
    const user = (process.env.EMAIL_USER || 'houseofaviraorders@gmail.com').trim().replace(/^["']|["']$/g, '');
    let pass = (process.env.EMAIL_PASS || '').trim().replace(/^["']|["']$/g, '');
    const cleanPass = pass.replace(/\s+/g, '');
    if (cleanPass.length === 16) {
      pass = cleanPass;
    }

    if (!user || !pass) {
      return {
        success: false,
        configured: false,
        user: user || null,
        error: 'EMAIL_USER or EMAIL_PASS environment variable is missing.'
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return {
      success: true,
      configured: true,
      user,
      message: 'SMTP connection verified successfully.'
    };
  } catch (err) {
    return {
      success: false,
      configured: true,
      code: err.code || 'UNKNOWN',
      error: err.message
    };
  }
}
