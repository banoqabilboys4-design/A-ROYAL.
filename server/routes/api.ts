import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User, Product } from '../db';
import { authenticate, requireAdmin, optionalAuth, generateToken, AuthRequest } from '../middleware/auth';
import { sendOrderNotifications, testSmtpConnection } from '../email';
import { sendAdminPhoneNotification } from '../messaging';
import { handleCustomerChat, handleCustomerChatStream, invalidateCatalogCache } from '../gemini';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ==========================================

// Login endpoint (Customer or Admin)
router.post('/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
});

// Customer registration
router.post('/auth/register', (req: Request, res: Response): void => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  // Never allow client to register as admin!
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    email,
    passwordHash,
    role: 'customer',
    phone,
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
    },
  });
});

// Current user profile
router.get('/auth/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = db.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
});

// ==========================================
// 2. PRODUCT CATALOG
// ==========================================

// Get all products (Public)
router.get('/products', (_req: Request, res: Response): void => {
  const products = db.getProducts();
  res.json({ products });
});

// Get single product (Public)
router.get('/products/:id', (req: Request, res: Response): void => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

// Create product (Admin only)
router.post('/products', requireAdmin, (req: Request, res: Response): void => {
  const { name, category, price, old_price, image, description, stock, featured, specifications } = req.body;

  if (!name || !category || price === undefined || !image) {
    res.status(400).json({ error: 'Name, category, price, and image are required' });
    return;
  }

  const newProd: Product = {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000),
    name,
    category,
    price: Number(price),
    old_price: old_price ? Number(old_price) : undefined,
    image,
    description: description || '',
    stock: Number(stock) || 0,
    featured: !!featured,
    specifications: specifications || {},
    createdAt: new Date().toISOString(),
  };

  const created = db.createProduct(newProd);
  invalidateCatalogCache();
  res.status(201).json({ product: created });
});

// Update product (Admin only)
router.put('/products/:id', requireAdmin, (req: Request, res: Response): void => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  invalidateCatalogCache();
  res.json({ product: updated });
});

// Delete product (Admin only)
router.delete('/products/:id', requireAdmin, (req: Request, res: Response): void => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  invalidateCatalogCache();
  res.json({ success: true, message: 'Product removed from catalog' });
});

// ==========================================
// 3. REAL ORDER WORKFLOW
// ==========================================

// Create new order (Public with optional customer auth)
// CRITICAL: Server-side validation reading prices strictly from the DB!
router.post('/orders', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { customer, items, paymentMethod } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Invalid order payload. Customer details and items are required.' });
    return;
  }

  // Atomic database execution: verifies stock, price lookup, stock decrement, order ID generation
  const result = db.createOrderAtomic(
    customer,
    items,
    paymentMethod || 'Cash on Delivery (COD)',
    req.user?.id
  );

  if (!result.success || !result.order) {
    res.status(400).json({ error: result.error || 'Failed to process order' });
    return;
  }

  const createdOrder = result.order;

  // Asynchronous notifications (Non-blocking so failure never interrupts order persistence)
  sendOrderNotifications(createdOrder).catch((err) => {
    console.error(`[BACKGROUND EMAIL NOTIFICATION FAILED] ${err?.message}`);
  });

  sendAdminPhoneNotification(createdOrder).catch((err) => {
    console.error(`[BACKGROUND PHONE NOTIFICATION FAILED] ${err?.message}`);
  });

  res.status(201).json({
    success: true,
    order: createdOrder,
    message: 'Order successfully registered in database',
  });
});

// Track order by Order ID and Phone (Public)
router.get('/orders/track', (req: Request, res: Response): void => {
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: 'Please provide an Order ID or phone number' });
    return;
  }

  const cleanQ = query.trim().toUpperCase();
  const directOrder = db.getOrderById(cleanQ);

  if (directOrder) {
    res.json({ order: directOrder });
    return;
  }

  // Lookup by phone number
  const matchingOrders = db.getOrdersByCustomer(query);
  if (matchingOrders.length > 0) {
    res.json({ order: matchingOrders[0], allMatchesCount: matchingOrders.length });
    return;
  }

  res.status(404).json({ error: `No active order found matching reference "${query}".` });
});

// Customer's own orders (Authenticated)
router.get('/orders/my-orders', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userOrders = db.getOrdersByUserId(req.user.id);
  // Also match by email if registered
  const emailOrders = db.getOrdersByCustomer(req.user.email);
  const combined = Array.from(new Set([...userOrders, ...emailOrders]));

  res.json({ orders: combined });
});

// ==========================================
// 4. ADMIN ORDERS & ANALYTICS
// ==========================================

// Get all orders (Admin only)
router.get('/admin/orders', requireAdmin, (req: Request, res: Response): void => {
  const statusFilter = req.query.status as string;
  const search = (req.query.search as string || '').toLowerCase();

  let orders = db.getOrders();

  if (statusFilter && statusFilter !== 'All') {
    orders = orders.filter((o) => o.status === statusFilter);
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(search) ||
        o.customer.name.toLowerCase().includes(search) ||
        o.customer.phone.includes(search) ||
        o.customer.city.toLowerCase().includes(search)
    );
  }

  res.json({ orders, totalCount: orders.length });
});

// Update order status (Admin only)
router.patch('/admin/orders/:id/status', requireAdmin, (req: Request, res: Response): void => {
  const { status, paymentStatus } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Order status is required' });
    return;
  }

  const updated = db.updateOrderStatus(req.params.id, status, paymentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order: updated, success: true });
});

// Delete order (Admin only)
router.delete('/admin/orders/:id', requireAdmin, (req: Request, res: Response): void => {
  const initialLen = db.getOrders().length;
  // delete
  const all = db.getOrders().filter((o) => o.id !== req.params.id);
  if (all.length === initialLen) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  // Re-save
  (db as any).data.orders = all;
  (db as any).saveToDisk((db as any).data);
  res.json({ success: true, message: `Order ${req.params.id} deleted` });
});

// Admin Dashboard Analytics (Admin only)
router.get('/admin/analytics', requireAdmin, (_req: Request, res: Response): void => {
  const orders = db.getOrders();
  const products = db.getProducts();

  const totalRevenue = orders.reduce(
    (acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0),
    0
  );

  const statusCounts = {
    pending: orders.filter((o) => o.status === 'Pending').length,
    confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    shipped: orders.filter((o) => o.status === 'Shipped').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  const recentOrders = orders.slice(0, 10);

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    statusCounts,
    totalProducts: products.length,
    recentOrders,
  });
});

// ==========================================
// 5. STORE SETTINGS & EMAIL CONFIG
// ==========================================

// Get settings (Public)
router.get('/settings', (_req: Request, res: Response): void => {
  const settings = db.getSettings();
  // Don't expose smtp password to public
  const safeSettings = {
    ...settings,
    emailConfig: {
      ...settings.emailConfig,
      pass: settings.emailConfig.pass ? '••••••••' : '',
    },
  };
  res.json({ settings: safeSettings });
});

// Update settings (Admin only)
router.put('/admin/settings', requireAdmin, (req: Request, res: Response): void => {
  const updates = req.body;
  const current = db.getSettings();

  // If password was placeholder, retain existing password
  if (updates.emailConfig && updates.emailConfig.pass === '••••••••') {
    updates.emailConfig.pass = current.emailConfig.pass;
  }

  const updated = db.updateSettings(updates);
  res.json({ settings: updated, success: true });
});

// Test SMTP connection (Admin only)
router.post('/admin/test-email', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const result = await testSmtpConnection();
  res.json(result);
});

// ==========================================
// 6. AI CHATBOT (GEMINI API)
// ==========================================

// Streaming AI Chatbot endpoint for ultra-low latency responses
router.post('/chat/stream', async (req: Request, res: Response): Promise<void> => {
  const { sessionId, message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }

  const effectiveSessionId = sessionId || `session-${Date.now()}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const result = await handleCustomerChatStream(effectiveSessionId, message, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write(
      `data: ${JSON.stringify({
        done: true,
        orderFound: result.orderFound,
        sessionId: effectiveSessionId,
      })}\n\n`
    );
    res.end();
  } catch (err: any) {
    console.error('[STREAM CHAT ERROR]', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to stream response' })}\n\n`);
    res.end();
  }
});

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { sessionId, message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }

  const effectiveSessionId = sessionId || `session-${Date.now()}`;
  try {
    const chatResult = await handleCustomerChat(effectiveSessionId, message);
    res.json({
      reply: chatResult.reply,
      orderFound: chatResult.orderFound,
      sessionId: effectiveSessionId,
    });
  } catch (err: any) {
    console.error('[API CHAT ERROR]', err);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

export default router;
