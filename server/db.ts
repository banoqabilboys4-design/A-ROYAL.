import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Watches' | 'Perfumes' | 'Accessories';
  price: number;
  old_price?: number;
  image: string;
  description: string;
  stock: number;
  featured?: boolean;
  specifications: Record<string, string>;
  createdAt: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

export interface EmailNotificationStatus {
  customer: 'sent' | 'pending' | 'failed' | 'not_configured';
  admin: 'sent' | 'pending' | 'failed' | 'not_configured';
  error?: string;
  lastAttempt?: string;
}

export interface PhoneNotificationStatus {
  status: 'sent' | 'pending' | 'failed' | 'not_configured';
  recipient?: string;
  provider?: string;
  error?: string;
  timestamp?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: 'Unpaid' | 'Paid';
  emailNotificationStatus: EmailNotificationStatus;
  phoneNotificationStatus?: PhoneNotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  adminPhone: string;
  adminEmail: string;
  currency: string;
  freeShippingThreshold: number;
  shippingFee: number;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
  emailConfig: {
    enabled: boolean;
    provider: 'smtp' | 'resend';
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  chatSessions: ChatSession[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store_db.json');

// Initial seed catalog
const SEED_PRODUCTS: Product[] = [
  {
    id: 'royal-chronograph',
    name: 'Royal Chronograph',
    category: 'Watches',
    price: 24999,
    old_price: 29999,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
    description: 'A refined everyday chronograph with surgical 316L stainless steel, dual-subdial chronograph layout, and sapphire crystal glass.',
    stock: 16,
    featured: true,
    specifications: {
      Case: '42mm 316L Stainless Steel',
      Movement: 'Precision Japanese Quartz Chronograph',
      Glass: 'Scratch-Resistant Sapphire Crystal',
      WaterResistance: '5 ATM (50 Meters)',
      Strap: 'Solid Steel Link Bracelet with Butterfly Clasp',
    },
    createdAt: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'noir-automatic',
    name: 'Noir Automatic',
    category: 'Watches',
    price: 32999,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    description: 'Minimal automatic styling designed for formal wear with an exposed exhibition sapphire caseback and obsidian matte finish.',
    stock: 10,
    featured: true,
    specifications: {
      Case: '40mm Matte Obsidian Black PVD',
      Movement: 'Automatic Self-Winding (40hr reserve)',
      Glass: 'Anti-Reflective Sapphire Crystal',
      WaterResistance: '5 ATM',
      Strap: 'Genuine Full-Grain Italian Calfskin',
    },
    createdAt: '2026-01-12T12:00:00.000Z',
  },
  {
    id: 'imperial-silver',
    name: 'Imperial Silver',
    category: 'Watches',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80',
    description: 'Clean silver-tone architecture featuring sunburst guilloché dial, slim bezel profile, and faceted baton markers.',
    stock: 25,
    featured: false,
    specifications: {
      Case: '39mm Polished Stainless Steel',
      Movement: 'Slimline High-Precision Quartz',
      Glass: 'Hardened Mineral Crystal',
      WaterResistance: '3 ATM',
      Strap: 'Engineered Brushed Steel Mesh',
    },
    createdAt: '2026-01-15T12:00:00.000Z',
  },
  {
    id: 'monarch-rose-gold',
    name: 'Monarch Rose Gold',
    category: 'Watches',
    price: 36500,
    old_price: 42000,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80',
    description: 'Warm 18K rose gold-tone bezel accented by a textured sunburst dial, blued hands, and hand-stitched leather strap.',
    stock: 12,
    featured: true,
    specifications: {
      Case: '41mm 18K Rose Gold Ion Plated',
      Movement: 'Miyota Automatic Calibre',
      Glass: 'Curved Sapphire Crystal',
      WaterResistance: '5 ATM',
      Strap: 'Hand-Stitched Embossed Leather',
    },
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'sovereign-diver',
    name: 'Sovereign Diver 200M',
    category: 'Watches',
    price: 28500,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
    description: 'Robust maritime timepiece with unidirectional ceramic diver bezel, Super-LumiNova indices, and 200m depth rating.',
    stock: 14,
    featured: false,
    specifications: {
      Case: '43mm Brushed 316L Steel',
      Movement: 'High-Torque Quartz Calibre',
      Glass: 'Double-Domed Sapphire Crystal',
      WaterResistance: '20 ATM (200 Meters)',
      Strap: 'Reinforced Fluororubber Diver Band',
    },
    createdAt: '2026-02-15T14:00:00.000Z',
  },
  {
    id: 'royal-oud',
    name: 'Royal Oud Extrait',
    category: 'Perfumes',
    price: 7499,
    old_price: 8999,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
    description: 'An opulent symphony of rare Cambodian agarwood, Taif rose, warm ambergris, and smoky leather. 14+ hours sillage.',
    stock: 22,
    featured: true,
    specifications: {
      Concentration: 'Extrait de Parfum (32% Oil)',
      TopNotes: 'Saffron, Pink Pepper, Sicilian Bergamot',
      HeartNotes: 'Taif Rose, Aged Oud Wood, Cedarwood',
      BaseNotes: 'Ambergris, Smoke Birch, Madagascar Vanilla',
      Volume: '100ml / 3.4 fl. oz.',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'velvet-noir',
    name: 'Velvet Noir',
    category: 'Perfumes',
    price: 6499,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
    description: 'A magnetic nocturnal creation pairing black cardamom, Tuscan leather, violet leaf, and warm roasted tonka bean.',
    stock: 18,
    featured: true,
    specifications: {
      Concentration: 'Eau de Parfum Intense (26% Oil)',
      TopNotes: 'Italian Bergamot, Cardamom, Clary Sage',
      HeartNotes: 'Tuscan Leather, Smoked Cedar, Violet Leaf',
      BaseNotes: 'Haitian Vetiver, Amber, Tonka Bean',
      Volume: '100ml / 3.4 fl. oz.',
    },
    createdAt: '2026-03-06T10:00:00.000Z',
  },
  {
    id: 'white-amber-crystal',
    name: 'White Amber Crystal',
    category: 'Perfumes',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80',
    description: 'Ethereal crystal-clean luxury opening with white jasmine petals, fresh neroli, solar amber, and soft velvet musk.',
    stock: 30,
    featured: false,
    specifications: {
      Concentration: 'Eau de Parfum (24% Oil)',
      TopNotes: 'White Freesia, Jasmine Petals, Sweet Neroli',
      HeartNotes: 'Crystalline White Amber, Virginian Cedarwood',
      BaseNotes: 'Cashmeran, Velvet White Musk, Golden Benzoin',
      Volume: '100ml / 3.4 fl. oz.',
    },
    createdAt: '2026-03-07T10:00:00.000Z',
  },
  {
    id: 'royal-tobacco-bourbon',
    name: 'Royal Tobacco & Bourbon',
    category: 'Perfumes',
    price: 8900,
    old_price: 10200,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
    description: 'Addictive warm blend of cured tobacco blossom, aged Kentucky bourbon vanilla, roasted cacao, and golden honeycomb.',
    stock: 16,
    featured: true,
    specifications: {
      Concentration: 'Extrait de Parfum (30% Oil)',
      TopNotes: 'Tobacco Blossom, Spiced Cinnamon, Star Anise',
      HeartNotes: 'Bourbon Vanilla Pod, Roasted Cacao, Tonka Bean',
      BaseNotes: 'Blonde Woods, Aged Tobacco Leaf, Honey Resin',
      Volume: '100ml / 3.4 fl. oz.',
    },
    createdAt: '2026-03-08T10:00:00.000Z',
  },
];

const SEED_SETTINGS: StoreSettings = {
  storeName: 'A.ROYAL',
  tagline: 'Luxury That Defines You',
  phone: '+92 311 0706379',
  whatsappNumber: '+923110706379',
  adminPhone: process.env.ADMIN_PHONE || '03110706379',
  adminEmail: process.env.ADMIN_EMAIL || 'wahab.nadeem6040@gmail.com',
  currency: 'PKR',
  freeShippingThreshold: 5000,
  shippingFee: 0,
  bankDetails: {
    bankName: 'Meezan Bank Ltd',
    accountTitle: 'A.ROYAL LUXURY LTD',
    accountNumber: '01010101010101',
    iban: 'PK00MEZN0001010101010101',
  },
  emailConfig: {
    enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    provider: 'smtp',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'A.ROYAL Luxury Concierge <orders@aroyal.pk>',
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        return {
          users: parsed.users || [],
          products: parsed.products || SEED_PRODUCTS,
          orders: parsed.orders || [],
          settings: { ...SEED_SETTINGS, ...(parsed.settings || {}) },
          chatSessions: parsed.chatSessions || [],
        };
      } catch (err) {
        console.error('Error reading database file, initializing fresh schema', err);
      }
    }

    // Initialize with default admin user
    const defaultAdminHash = bcrypt.hashSync('WAHABNADEEM', 10);
    const initialAdmin: User = {
      id: 'usr-admin-royal',
      name: 'A.ROYAL Executive Administrator',
      email: 'admin@aroyal.pk',
      passwordHash: defaultAdminHash,
      role: 'admin',
      phone: '+92 300 0000000',
      createdAt: new Date().toISOString(),
    };

    const initialDb: DatabaseSchema = {
      users: [initialAdmin],
      products: SEED_PRODUCTS,
      orders: [], // Real database starts with ZERO fake orders as mandated!
      settings: SEED_SETTINGS,
      chatSessions: [],
    };

    this.saveToDisk(initialDb);
    return initialDb;
  }

  private saveToDisk(schema: DatabaseSchema): void {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(schema, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  // --- Users / Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.saveToDisk(this.data);
    return user;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.saveToDisk(this.data);
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveToDisk(this.data);
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveToDisk(this.data);
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    const clean = id.trim().toUpperCase();
    return this.data.orders.find((o) => o.id.toUpperCase() === clean);
  }

  public getOrdersByCustomer(emailOrPhone: string): Order[] {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanDigits = emailOrPhone.replace(/[^0-9]/g, '');
    return this.data.orders.filter((o) => {
      const emailMatch = o.customer.email && o.customer.email.toLowerCase() === clean;
      const phoneMatch = cleanDigits.length >= 7 && o.customer.phone.replace(/[^0-9]/g, '').includes(cleanDigits);
      return emailMatch || phoneMatch;
    });
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  public saveOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.saveToDisk(this.data);
    return order;
  }

  public updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx].status = status;
    if (paymentStatus) {
      this.data.orders[idx].paymentStatus = paymentStatus;
    }
    this.data.orders[idx].updatedAt = new Date().toISOString();
    this.saveToDisk(this.data);
    return this.data.orders[idx];
  }

  public updateOrderEmailStatus(id: string, emailStatus: Partial<EmailNotificationStatus>): void {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return;
    this.data.orders[idx].emailNotificationStatus = {
      ...this.data.orders[idx].emailNotificationStatus,
      ...emailStatus,
      lastAttempt: new Date().toISOString(),
    };
    this.saveToDisk(this.data);
  }

  public updateOrderPhoneStatus(id: string, phoneStatus: Partial<PhoneNotificationStatus>): void {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return;
    this.data.orders[idx].phoneNotificationStatus = {
      ...(this.data.orders[idx].phoneNotificationStatus || {
        status: 'not_configured',
        recipient: '03110706379',
      }),
      ...phoneStatus,
      timestamp: new Date().toISOString(),
    };
    this.saveToDisk(this.data);
  }

  // Atomic transaction to create an order:
  // Verifies stock and prices from DB, deducts stock, and saves order atomically!
  public createOrderAtomic(
    customer: CustomerDetails,
    requestedItems: { productId: string; quantity: number }[],
    paymentMethod: string,
    userId?: string
  ): { success: boolean; order?: Order; error?: string } {
    if (!requestedItems || requestedItems.length === 0) {
      return { success: false, error: 'No items in cart' };
    }

    // Step 1: Validate customer details
    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      return { success: false, error: 'Customer name, phone, address and city are required' };
    }

    // Step 2: Validate each item and check verified price and stock in DB
    const validatedItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const req of requestedItems) {
      const product = this.getProductById(req.productId);
      if (!product) {
        return { success: false, error: `Product with ID ${req.productId} does not exist in catalog` };
      }

      if (req.quantity <= 0) {
        return { success: false, error: `Invalid quantity for ${product.name}` };
      }

      if (product.stock < req.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        };
      }

      const itemTotal = product.price * req.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price, // STRICTLY READ FROM DATABASE, NEVER TRUSTED FROM BROWSER
        quantity: req.quantity,
        image: product.image,
      });
    }

    // Step 3: Calculate shipping
    const shippingFee = calculatedSubtotal >= this.data.settings.freeShippingThreshold ? 0 : this.data.settings.shippingFee;
    const grandTotal = calculatedSubtotal + shippingFee;

    // Step 4: Deduct stock from database atomically
    for (const item of validatedItems) {
      const pIdx = this.data.products.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        this.data.products[pIdx].stock -= item.quantity;
      }
    }

    // Step 5: Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ROYAL-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      userId,
      customer: {
        ...customer,
        whatsapp: customer.whatsapp || customer.phone,
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shippingFee,
      total: grandTotal,
      status: 'Pending',
      paymentMethod,
      paymentStatus: 'Unpaid',
      emailNotificationStatus: {
        customer: 'pending',
        admin: 'pending',
      },
      phoneNotificationStatus: {
        status: 'not_configured',
        recipient: '03110706379',
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save to persistent file
    this.data.orders.unshift(newOrder);
    this.saveToDisk(this.data);

    return { success: true, order: newOrder };
  }

  // --- Settings ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveToDisk(this.data);
    return this.data.settings;
  }

  // --- Chat Sessions ---
  public getChatSession(sessionId: string): ChatSession | undefined {
    return this.data.chatSessions.find((s) => s.sessionId === sessionId);
  }

  public saveChatMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatSession {
    let session = this.data.chatSessions.find((s) => s.sessionId === sessionId);
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: message.role,
      content: message.content,
      timestamp: now,
    };

    if (!session) {
      session = {
        sessionId,
        messages: [newMsg],
        updatedAt: now,
      };
      this.data.chatSessions.unshift(session);
    } else {
      session.messages.push(newMsg);
      session.updatedAt = now;
    }

    this.saveToDisk(this.data);
    return session;
  }
}

export const db = new Database();
