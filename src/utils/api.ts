import { Product, Order, CustomerDetails, StoreSettings } from '../data/initialData';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('aroyal_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  } catch (err) {
    console.error('API fetchProducts error:', err);
    throw err;
  }
}

export async function submitRealOrder(
  customer: CustomerDetails,
  items: { productId: string; quantity: number }[],
  paymentMethod: string
): Promise<{ success: boolean; order: Order; message?: string }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ customer, items, paymentMethod }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server rejected order submission');
  }

  return data;
}

export async function trackOrderApi(query: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/track?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Order lookup failed');
  }
  return data.order;
}

export async function loginApi(email: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid credentials');
  }
  localStorage.setItem('aroyal_auth_token', data.token);
  return data;
}

export async function registerApi(userData: { name: string; email: string; password: string; phone?: string }): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  localStorage.setItem('aroyal_auth_token', data.token);
  return data;
}

export async function fetchAdminOrders(status = 'All', search = ''): Promise<{ orders: Order[]; totalCount: number }> {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.set('status', status);
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unauthorized to fetch admin orders');
  }
  return data;
}

export async function updateOrderStatusApi(orderId: string, status: string, paymentStatus?: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, paymentStatus }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update order status');
  }
  return data.order;
}

export async function deleteOrderApi(orderId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete order');
  }
  return true;
}

export async function fetchAdminAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load analytics');
  }
  return data;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load store settings');
  return data.settings;
}

export async function updateStoreSettingsApi(settings: StoreSettings): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data.settings;
}

export async function testEmailApi(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/test-email`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
  });
  return res.json();
}

export async function createProductApi(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data.product;
}

export async function updateProductApi(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data.product;
}

export async function deleteProductApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  return true;
}

export async function sendChatMessageApi(message: string, sessionId?: string): Promise<{ reply: string; orderFound?: any; sessionId: string }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send chat message');
  return data;
}

export async function sendChatMessageStreamApi(
  message: string,
  sessionId: string,
  onChunk: (chunk: string) => void
): Promise<{ orderFound?: any; sessionId: string }> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok || !res.body) {
    const data = await sendChatMessageApi(message, sessionId);
    onChunk(data.reply);
    return { orderFound: data.orderFound, sessionId: data.sessionId };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let orderFound = undefined;
  let finalSessionId = sessionId;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          const payload = JSON.parse(trimmed.substring(6));
          if (payload.chunk) {
            onChunk(payload.chunk);
          }
          if (payload.done) {
            orderFound = payload.orderFound;
            if (payload.sessionId) finalSessionId = payload.sessionId;
          }
        } catch {
          // ignore chunk parse edge cases
        }
      }
    }
  }

  return { orderFound, sessionId: finalSessionId };
}
