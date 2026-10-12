import { Order, db } from './db';
import { formatPKR } from './email';

export interface PhoneNotificationResult {
  success: boolean;
  status: 'sent' | 'failed' | 'not_configured';
  provider: string;
  recipient: string;
  error?: string;
}

export async function sendAdminPhoneNotification(order: Order): Promise<PhoneNotificationResult> {
  const settings = db.getSettings();
  const adminPhone = process.env.ADMIN_PHONE || settings.adminPhone || '03110706379';
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
  const formattedE164 = cleanPhone.startsWith('92') ? `+${cleanPhone}` : `+92${cleanPhone.replace(/^0/, '')}`;

  const messageText = `👑 [A.ROYAL] New Inbound Order ${order.id}\nCustomer: ${order.customer.name} (${order.customer.phone})\nCity: ${order.customer.city}\nItems: ${order.items.length}\nTotal: ${formatPKR(order.total)}\nPayment: ${order.paymentMethod}`;

  // Check Twilio credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_PHONE;

  if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const body = new URLSearchParams({
        To: formattedE164,
        From: twilioFrom,
        Body: messageText,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Twilio SMS dispatch failed');
      }

      console.log(`[PHONE NOTIFICATION] SMS successfully delivered to admin phone ${formattedE164} via Twilio`);
      db.updateOrderPhoneStatus(order.id, {
        status: 'sent',
        provider: 'Twilio SMS',
        recipient: formattedE164,
      });

      return {
        success: true,
        status: 'sent',
        provider: 'Twilio SMS',
        recipient: formattedE164,
      };
    } catch (err: any) {
      console.error(`[PHONE NOTIFICATION FAILED] ${err?.message}`);
      db.updateOrderPhoneStatus(order.id, {
        status: 'failed',
        provider: 'Twilio SMS',
        recipient: formattedE164,
        error: err?.message || 'Twilio API call failed',
      });

      return {
        success: false,
        status: 'failed',
        provider: 'Twilio SMS',
        recipient: formattedE164,
        error: err?.message,
      };
    }
  }

  // Check WhatsApp Business Cloud API credentials
  const waToken = process.env.WHATSAPP_BUSINESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waToken && waPhoneId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedE164.replace('+', ''),
          type: 'text',
          text: { body: messageText },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'WhatsApp Cloud API dispatch failed');
      }

      console.log(`[PHONE NOTIFICATION] WhatsApp alert delivered to admin phone ${formattedE164}`);
      db.updateOrderPhoneStatus(order.id, {
        status: 'sent',
        provider: 'WhatsApp Business API',
        recipient: formattedE164,
      });

      return {
        success: true,
        status: 'sent',
        provider: 'WhatsApp Business API',
        recipient: formattedE164,
      };
    } catch (err: any) {
      console.error(`[PHONE NOTIFICATION FAILED] ${err?.message}`);
      db.updateOrderPhoneStatus(order.id, {
        status: 'failed',
        provider: 'WhatsApp Business API',
        recipient: formattedE164,
        error: err?.message,
      });

      return {
        success: false,
        status: 'failed',
        provider: 'WhatsApp Business API',
        recipient: formattedE164,
        error: err?.message,
      };
    }
  }

  // Not configured: Log honestly without pretending
  const reason = 'SMS / WhatsApp Business API credentials not configured in environment (TWILIO_ACCOUNT_SID/TOKEN or WHATSAPP_BUSINESS_TOKEN required).';
  console.warn(`[PHONE NOTIFICATION] ${reason} Admin phone ${formattedE164} logged as not_configured.`);

  db.updateOrderPhoneStatus(order.id, {
    status: 'not_configured',
    provider: 'None (Unconfigured)',
    recipient: formattedE164,
    error: reason,
  });

  return {
    success: false,
    status: 'not_configured',
    provider: 'None (Unconfigured)',
    recipient: formattedE164,
    error: reason,
  };
}
