import { GoogleGenAI } from '@google/genai';
import { db } from './db';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// IN-MEMORY CACHE FOR PUBLIC STORE POLICIES & CATALOG SUMMARY
// Caches public catalog so we don't serialize the entire database on every user turn
let cachedCatalogSummary = '';
let cachedBaseSystemPrompt = '';
let lastCatalogCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedBaseSystemInstruction(): string {
  const now = Date.now();
  if (cachedBaseSystemPrompt && now - lastCatalogCacheTime < CACHE_TTL_MS) {
    return cachedBaseSystemPrompt;
  }

  const products = db.getProducts();
  const settings = db.getSettings();

  cachedCatalogSummary = products
    .map(
      (p) =>
        `- ${p.name} (${p.category}): PKR ${p.price.toLocaleString()} | Stock: ${
          p.stock > 0 ? `${p.stock} available` : 'Sold out'
        } | ${p.description}`
    )
    .join('\n');

  cachedBaseSystemPrompt = `
You are the official AI Concierge for "A.ROYAL — Luxury That Defines You", Pakistan's premier luxury horology and haute parfumerie atelier.
Your tone is refined, hospitable, articulate, and trustworthy (use brief Urdu greetings like "Assalam-o-Alaikum").

ACCURATE STORE KNOWLEDGE BASE (SOURCE OF TRUTH):
Store Name: ${settings.storeName} (${settings.tagline})
Hotline / WhatsApp: ${settings.whatsappNumber}
Admin Contact: ${settings.adminPhone || '03110706379'} / ${settings.adminEmail || 'wahab.nadeem6040@gmail.com'}
Bank Details: ${settings.bankDetails.bankName} (Account: ${settings.bankDetails.accountTitle})

SHIPPING & POLICIES:
- Complimentary nationwide insured courier delivery across all cities of Pakistan.
- Cash on Delivery (COD): Inspect parcel at doorstep before paying courier.
- Direct Bank Transfer / Raast also available.
- 7-Day VIP Exchange Guarantee for all unworn timepieces and unopened perfumes.
- 100% Genuine Materials: Surgical-grade 316L steel, sapphire crystal lenses, and pure perfume extraits.

CURRENT PRODUCT CATALOG (NEVER INVENT PRICES OR SPECS):
${cachedCatalogSummary}

CRITICAL CONCISENESS & SPEED DIRECTIVES:
1. Short & Direct: Provide concise, 1 to 3 sentence answers by default. Avoid filler text or repetitive disclaimers.
2. Grounding: Rely strictly on the catalog above. Never hallucinate unavailable models or discounts.
3. Order Privacy: Never disclose one customer's full address or phone number to another.
4. When user asks about an order, ask for their ROYAL-XXXX reference if not provided.
`;

  lastCatalogCacheTime = now;
  return cachedBaseSystemPrompt;
}

export function invalidateCatalogCache(): void {
  lastCatalogCacheTime = 0;
}

// Streaming chat handler for ultra-low latency token delivery
export async function handleCustomerChatStream(
  sessionId: string,
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<{ fullReply: string; orderFound?: any }> {
  // Save user's question to persistent chat history
  db.saveChatMessage(sessionId, { role: 'user', content: userMessage });

  // Order lookup check (Dynamic and never cached across users!)
  const orderIdMatch = userMessage.match(/ROYAL-\d{4}/i);
  let orderContext = '';
  let orderFoundData = undefined;

  if (orderIdMatch) {
    const orderId = orderIdMatch[0].toUpperCase();
    const order = db.getOrderById(orderId);
    if (order) {
      orderFoundData = {
        id: order.id,
        status: order.status,
        customerName: order.customer.name,
        city: order.customer.city,
        total: order.total,
        itemsCount: order.items.length,
      };
      orderContext = `
VERIFIED DATABASE ORDER LOOKUP:
- Order Reference: ${order.id}
- Customer: ${order.customer.name.split(' ')[0]}
- Destination City: ${order.customer.city}
- Current Status: ${order.status}
- Total Amount: PKR ${order.total.toLocaleString()}
- Payment Method: ${order.paymentMethod}
- Items: ${order.items.map((i) => `${i.name} (Qty: ${i.quantity})`).join(', ')}
`;
    } else {
      orderContext = `ORDER LOOKUP RESULT: Order ID ${orderId} was NOT found in the database. Advise customer to check their reference number.`;
    }
  }

  const baseInstruction = getCachedBaseSystemInstruction();
  const effectiveSystemInstruction = orderContext
    ? `${baseInstruction}\n\n${orderContext}`
    : baseInstruction;

  let accumulatedText = '';

  if (ai) {
    try {
      const session = db.getChatSession(sessionId);
      const conversationHistory = (session?.messages || []).slice(-4).map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      // Stream generation for instant first-token visibility
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [
          ...conversationHistory.slice(0, -1),
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: effectiveSystemInstruction,
          temperature: 0.1,
          maxOutputTokens: 350,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          accumulatedText += text;
          onChunk(text);
        }
      }

      if (accumulatedText) {
        db.saveChatMessage(sessionId, { role: 'model', content: accumulatedText });
        return { fullReply: accumulatedText, orderFound: orderFoundData };
      }
    } catch (err) {
      console.error('[GEMINI STREAM ERROR]', err);
    }
  }

  // Fast Rule-Based Fallback
  const settings = db.getSettings();
  let fallbackReply = '';
  const lower = userMessage.toLowerCase();

  if (orderContext.includes('VERIFIED DATABASE ORDER LOOKUP')) {
    fallbackReply = `Assalam-o-Alaikum! We located your order **${orderFoundData?.id}**. It is currently marked as **${orderFoundData?.status}** for delivery to ${orderFoundData?.city}. Total payable is PKR ${orderFoundData?.total?.toLocaleString()}.`;
  } else if (orderIdMatch && orderContext.includes('NOT found')) {
    fallbackReply = `We could not find an active order matching reference **${orderIdMatch[0]}**. Please double-check your Order ID.`;
  } else if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('cod')) {
    fallbackReply = `We provide complimentary insured courier delivery nationwide across Pakistan. You can pay via **Cash on Delivery (COD)** upon inspecting your parcel at your doorstep.`;
  } else if (lower.includes('watch') || lower.includes('chronograph')) {
    fallbackReply = `Our flagship timepieces include the **Royal Chronograph** (PKR 24,999) and the **Noir Automatic** (PKR 32,999) with 316L surgical steel and scratch-resistant sapphire crystal glass.`;
  } else if (lower.includes('perfume') || lower.includes('oud')) {
    fallbackReply = `Our signature scents include **Royal Oud Extrait** (PKR 7,499) and **Velvet Noir** (PKR 6,499), formulated with high-concentration perfume oils for 14+ hours of sillage.`;
  } else {
    fallbackReply = `Assalam-o-Alaikum! Welcome to A.ROYAL. How may I assist your inquiry regarding our timepieces, extrait perfumes, or order tracking today?`;
  }

  onChunk(fallbackReply);
  db.saveChatMessage(sessionId, { role: 'model', content: fallbackReply });
  return { fullReply: fallbackReply, orderFound: orderFoundData };
}

// Non-streaming fallback for backward compatibility
export async function handleCustomerChat(
  sessionId: string,
  userMessage: string
): Promise<{ reply: string; orderFound?: any }> {
  let reply = '';
  const result = await handleCustomerChatStream(sessionId, userMessage, (chunk) => {
    reply += chunk;
  });
  return { reply: result.fullReply, orderFound: result.orderFound };
}
