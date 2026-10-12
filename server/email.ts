import nodemailer from 'nodemailer';
import { Order, db } from './db';

interface EmailSendResult {
  customerSuccess: boolean;
  adminSuccess: boolean;
  customerStatus: 'sent' | 'failed' | 'not_configured';
  adminStatus: 'sent' | 'failed' | 'not_configured';
  error?: string;
}

function createTransporter() {
  const settings = db.getSettings();
  const config = settings.emailConfig;

  const host = process.env.SMTP_HOST || config.host || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || config.port || 465;
  const user = process.env.SMTP_USER || config.user;
  const pass = process.env.SMTP_PASS || config.pass;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export function formatPKR(amount: number): string {
  return 'PKR ' + Math.round(amount).toLocaleString('en-US');
}

export async function sendOrderNotifications(order: Order): Promise<EmailSendResult> {
  const settings = db.getSettings();
  const adminEmail = process.env.ADMIN_EMAIL || settings.adminEmail || 'wahab.nadeem6040@gmail.com';
  const fromAddress = process.env.EMAIL_FROM || settings.emailConfig.from || 'A.ROYAL Luxury Concierge <orders@aroyal.pk>';

  const transporter = createTransporter();

  if (!transporter) {
    const errorMsg = 'SMTP credentials not configured in environment (SMTP_USER & SMTP_PASS required). Notifications logged to database as not_configured.';
    console.warn(`[EMAIL DISPATCH] ${errorMsg} for order ${order.id}`);

    db.updateOrderEmailStatus(order.id, {
      customer: 'not_configured',
      admin: 'not_configured',
      error: errorMsg,
    });

    return {
      customerSuccess: false,
      adminSuccess: false,
      customerStatus: 'not_configured',
      adminStatus: 'not_configured',
      error: errorMsg,
    };
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 12px 8px; font-weight: bold; color: #151515;">
          ${item.name}
          <div style="font-size: 11px; color: #8b7650; text-transform: uppercase;">${item.category}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #555;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #151515; font-weight: bold;">${formatPKR(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  // 1. Customer Email HTML Template
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px; color: #151515;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dfd8cc; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #151515; padding: 28px 24px; text-align: center; border-bottom: 3px solid #c9ad79;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 4px; text-transform: uppercase; font-family: Georgia, serif;">A.ROYAL</h1>
          <p style="color: #c9ad79; margin: 4px 0 0; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Luxury That Defines You</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          <h2 style="font-size: 18px; margin-top: 0; color: #151515; font-family: Georgia, serif;">Thank You for Your Order, ${order.customer.name}</h2>
          <p style="font-size: 13px; color: #555; line-height: 1.6;">
            Your order has been recorded in our royal registry under reference <strong style="color: #8b7650;">${order.id}</strong>. Our concierge team is preparing your package for insured courier dispatch.
          </p>

          <!-- Order Summary Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
            <thead>
              <tr style="background-color: #f5f2eb; border-bottom: 2px solid #dfd8cc; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #666;">
                <th style="padding: 10px 8px; text-align: left;">Item</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px 8px; text-align: right; color: #666;">Subtotal:</td>
                <td style="padding: 10px 8px; text-align: right; font-weight: bold;">${formatPKR(order.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 8px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding: 8px 8px; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">Free Insured Delivery</td>
              </tr>
              <tr style="border-top: 2px solid #151515;">
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-size: 15px; font-weight: bold; color: #151515;">Grand Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-size: 16px; font-weight: bold; color: #151515;">${formatPKR(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping Details Box -->
          <div style="background-color: #faf9f6; border: 1px solid #dfd8cc; border-radius: 6px; padding: 16px; font-size: 12px; line-height: 1.6; margin-bottom: 20px;">
            <div style="font-weight: bold; color: #8b7650; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Delivery Details</div>
            <div><strong>Recipient:</strong> ${order.customer.name}</div>
            <div><strong>Phone / WhatsApp:</strong> ${order.customer.phone}</div>
            <div><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</div>
            <div><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
            ${order.customer.notes ? `<div><strong>Notes:</strong> <em>${order.customer.notes}</em></div>` : ''}
          </div>

          <p style="font-size: 12px; color: #777; text-align: center; margin-top: 24px;">
            Need assistance or instant delivery updates? Reach our 24/7 VIP Concierge on WhatsApp at <strong>${settings.whatsappNumber}</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #faf9f6; padding: 16px; text-align: center; border-top: 1px solid #dfd8cc; font-size: 11px; color: #999;">
          © 2026 A.ROYAL Luxury Ltd. All rights reserved. Precision Horology & Haute Parfumerie.
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. Admin Email HTML Template
  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #151515; padding: 24px; color: #dfd8cc;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #8b7650; padding: 16px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px;">👑 NEW ORDER RECEIVED — ${order.id}</h2>
          <p style="margin: 4px 0 0; font-size: 12px;">Amount: <strong>${formatPKR(order.total)}</strong> | Status: <strong>${order.status}</strong></p>
        </div>

        <div style="padding: 20px; font-size: 13px;">
          <h3 style="color: #c9ad79; font-size: 14px; margin-top: 0;">Customer Information:</h3>
          <p style="line-height: 1.6; margin: 0 0 16px;">
            <strong>Name:</strong> ${order.customer.name}<br>
            <strong>Phone:</strong> ${order.customer.phone}<br>
            <strong>Email:</strong> ${order.customer.email || 'N/A'}<br>
            <strong>City:</strong> ${order.customer.city}<br>
            <strong>Address:</strong> ${order.customer.address}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus}
          </p>

          <h3 style="color: #c9ad79; font-size: 14px; margin-top: 0;">Ordered Items (${order.items.length}):</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
            ${order.items
              .map(
                (i) => `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 8px 0; color: #ffffff;">${i.name} (${i.category})</td>
                <td style="padding: 8px 0; text-align: center; color: #aaa;">Qty: ${i.quantity}</td>
                <td style="padding: 8px 0; text-align: right; color: #c9ad79; font-weight: bold;">${formatPKR(i.price * i.quantity)}</td>
              </tr>
            `
              )
              .join('')}
          </table>

          <div style="text-align: right; font-size: 14px; font-weight: bold; color: #ffffff; border-top: 1px solid #444; padding-top: 8px;">
            Grand Total: ${formatPKR(order.total)}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let customerSuccess = false;
  let adminSuccess = false;
  let customerStatus: 'sent' | 'failed' | 'not_configured' = 'failed';
  let adminStatus: 'sent' | 'failed' | 'not_configured' = 'failed';
  let lastError = '';

  // Send Customer Email if customer provided email
  if (order.customer.email && order.customer.email.includes('@')) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: order.customer.email,
        subject: `Your Order Confirmation #${order.id} — A.ROYAL`,
        html: customerEmailHtml,
      });
      customerSuccess = true;
      customerStatus = 'sent';
      console.log(`[EMAIL DISPATCH] Customer confirmation successfully sent to ${order.customer.email}`);
    } catch (err: any) {
      console.error(`[EMAIL DISPATCH] Failed to send customer email to ${order.customer.email}:`, err);
      lastError = err?.message || 'Customer email delivery error';
      customerStatus = 'failed';
    }
  } else {
    customerStatus = 'not_configured'; // No email entered by customer
  }

  // Send Admin Email
  try {
    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `🚨 [A.ROYAL] New Inbound Order ${order.id} (${formatPKR(order.total)})`,
      html: adminEmailHtml,
    });
    adminSuccess = true;
    adminStatus = 'sent';
    console.log(`[EMAIL DISPATCH] Admin alert successfully sent to ${adminEmail}`);
  } catch (err: any) {
    console.error(`[EMAIL DISPATCH] Failed to send admin email to ${adminEmail}:`, err);
    lastError = err?.message || 'Admin email delivery error';
    adminStatus = 'failed';
  }

  db.updateOrderEmailStatus(order.id, {
    customer: customerStatus,
    admin: adminStatus,
    error: lastError || undefined,
  });

  return {
    customerSuccess,
    adminSuccess,
    customerStatus,
    adminStatus,
    error: lastError || undefined,
  };
}

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      message: 'SMTP credentials not configured (SMTP_USER & SMTP_PASS required).',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: 'SMTP connection verified successfully! Mail server is reachable and credentials are valid.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP connection failed: ${err?.message || 'Unknown error'}`,
    };
  }
}
