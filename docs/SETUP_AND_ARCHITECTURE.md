# A.ROYAL — Production E-Commerce Architecture & Setup Guide

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + TypeScript                │
│    (Tailwind CSS, Floating AI Chatbot, Order Tracking) │
└───────────────────────────┬────────────────────────────┘
                            │ /api/* REST Requests
┌───────────────────────────▼────────────────────────────┐
│              Node.js + Express Server (server.ts)      │
│  - JWT RBAC Middleware (Customer vs Admin Role Checks) │
│  - Strict Server-side Price & Stock Validation         │
│  - Atomic Transactional Order Registry Engine          │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼──────────────┐ ┌─────────▼──────────────┐
│     Persistent Database     │ │   Gemini AI Concierge  │
│ - Users (Bcrypt Passwords)  │ │ - @google/genai SDK    │
│ - Products & Live Stock     │ │ - Real Catalog Context │
│ - Orders & Order Items      │ │ - Verified Order Lookup│
│ - Store & Bank Settings     │ └────────────────────────┘
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  Real Email Dispatch Relay  │
│ - Customer Order Invoice    │
│ - Admin Alert (ADMIN_EMAIL) │
│ - Nodemailer (SMTP/Gmail)   │
└─────────────────────────────┘
```

---

## 2. Default Administrative Access

- **Admin Portal URL**: Click the "Admin" link in the top navigation or footer.
- **Admin Email**: `admin@aroyal.pk`
- **Password Storage**: Encrypted with salted bcrypt hash in `data/store_db.json`.

---

## 3. Real Gmail Notification Configuration

To enable automated email delivery to your inbox:

1. Enable **2-Step Verification** on your Google Account:
   `https://myaccount.google.com/security`
2. Generate a 16-character **Google App Password**:
   `https://myaccount.google.com/apppasswords`
3. Select App name: **"A.ROYAL Store"**.
4. Configure environment variables in `.env` (or via AI Studio Secrets):
   ```env
   ADMIN_EMAIL="banoqabilboys4@gmail.com"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="465"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="xxxx xxxx xxxx xxxx" # 16-digit App Password
   EMAIL_FROM="A.ROYAL Luxury Concierge <orders@aroyal.pk>"
   ```
5. In the Admin Dashboard under **Settings & Security**, click **"Test SMTP Connection"** to verify live communication with the mail server.

*Note: If SMTP credentials are not yet configured, the system records the order in the database and tags the email notification status as `not_configured`. An email failure will never erase or cancel a genuine customer order.*

---

## 4. Database Schema & Security Rules

### A. Collections Structure
- `users`: `{ id, name, email, passwordHash, role: 'admin'|'customer', phone, createdAt }`
- `products`: `{ id, name, category, price, old_price, image, description, stock, featured, specifications }`
- `orders`: `{ id, customer: { name, phone, email, city, address, notes }, items: [{ productId, name, price, quantity }], subtotal, shippingFee, total, status, paymentMethod, paymentStatus, emailNotificationStatus }`
- `settings`: `{ storeName, phone, whatsappNumber, freeShippingThreshold, bankDetails, adminEmail, emailConfig }`

### B. Firestore Rules
The project includes `firestore.rules` for turnkey deployment if using Google Cloud Firestore.
All order total calculations and stock deductions are enforced server-side.

---

## 5. End-to-End Verification Checklist

1. **Order Creation**: Add items to bag, checkout with Cash on Delivery (COD), verify price is validated from the database.
2. **Persistence**: Refresh the browser; the order remains saved in the database.
3. **Tracking**: Enter Order ID in the "Track Order" modal or prompt the AI Chatbot.
4. **Admin Panel**: Login with admin credentials, view the live order in the registry, change status to `Shipped` or `Delivered`.
