import {
  Product,
  Order,
  StoreSettings,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  DEFAULT_ADMIN_PASSWORD,
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'aroyal_stored_products_v2',
  ORDERS: 'aroyal_stored_orders_v2',
  SETTINGS: 'aroyal_stored_settings_v2',
  ADMIN_PASSWORD: 'aroyal_stored_admin_password_v2',
  ADMIN_TOKEN: 'aroyal_admin_session_token',
};

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(data);
    // Merge any missing initial products if needed
    const missing = INITIAL_PRODUCTS.filter(p => !parsed.some(item => item.id === p.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load products from storage', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products', err);
  }
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load orders from storage', err);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders', err);
  }
}

export function addOrder(newOrder: Order): void {
  const currentOrders = getStoredOrders();
  const updated = [newOrder, ...currentOrders];
  saveStoredOrders(updated);
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  const currentOrders = getStoredOrders();
  const updated = currentOrders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
      };
    }
    return order;
  });
  saveStoredOrders(updated);
  return updated;
}

export function deleteOrder(orderId: string): Order[] {
  const currentOrders = getStoredOrders();
  const updated = currentOrders.filter(o => o.id !== orderId);
  saveStoredOrders(updated);
  return updated;
}

export function getStoredSettings(): StoreSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    console.error('Failed to load settings', err);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function getAdminPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
}

export function formatPKR(amount: number): string {
  return 'PKR ' + Math.round(amount).toLocaleString('en-US');
}

export function buildWhatsAppOrderUrl(order: Order, whatsappNumber: string): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const itemsList = order.items
    .map(i => `• ${i.name} (Qty: ${i.quantity}) - ${formatPKR(i.price * i.quantity)}`)
    .join('\n');

  const text = `👑 *NEW ROYAL ORDER NOTIFICATION* 👑\n\n` +
    `*Order Reference:* ${order.id}\n` +
    `*Customer:* ${order.customer.name}\n` +
    `*Phone:* ${order.customer.phone}\n` +
    `*City:* ${order.customer.city}\n` +
    `*Shipping Address:* ${order.customer.address}\n` +
    (order.customer.notes ? `*Notes:* ${order.customer.notes}\n` : '') +
    `\n*Items Ordered:*\n${itemsList}\n\n` +
    `*Payment Method:* ${order.paymentMethod}\n` +
    `*Grand Total:* ${formatPKR(order.total)}\n` +
    `*Status:* ${order.status}\n\n` +
    `Please confirm dispatch with courier service.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppProductInquiryUrl(product: Product, whatsappNumber: string): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const text = `Assalam-o-Alaikum, I am inquiring about the *${product.name}* (${formatPKR(product.price)}) from A.ROYAL. Is this currently available for express delivery?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
