import React, { useState } from 'react';
import {
  Lock,
  LogOut,
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  MessageCircle,
  Printer,
  X,
  RotateCcw,
  ShieldCheck,
  Settings,
  Truck,
  Eye,
  Mail,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Product, Order, StoreSettings } from '../data/initialData';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredOrders,
  saveStoredOrders,
  updateOrderStatus,
  deleteOrder,
  getStoredSettings,
  saveStoredSettings,
  getAdminPassword,
  setAdminPassword,
  resetDemoData,
  formatPKR,
  buildWhatsAppOrderUrl,
} from '../utils/storage';
import {
  loginApi,
  fetchAdminOrders,
  updateOrderStatusApi,
  deleteOrderApi,
  testEmailApi,
  updateStoreSettingsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../utils/api';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onRefreshParent,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'settings'>('overview');

  // Loaded Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings());

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    category: 'Watches' | 'Perfumes' | 'Accessories';
    price: number;
    old_price: number | '';
    image: string;
    description: string;
    stock: number;
    featured: boolean;
    specificationsText: string;
  }>({
    name: '',
    category: 'Watches',
    price: 19999,
    old_price: '',
    image: '',
    description: '',
    stock: 10,
    featured: false,
    specificationsText: 'Case: 42mm 316L Stainless Steel\nMovement: Precision Japanese Quartz\nGlass: Sapphire Crystal\nWaterResistance: 5 ATM\nStrap: Solid Steel Link Bracelet',
  });

  // Password change state
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordChangedSuccess, setPasswordChangedSuccess] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean }>({ testing: false });

  // Load real data from backend API
  const refreshAdminData = async () => {
    try {
      const res = await fetchAdminOrders();
      setOrders(res.orders);
    } catch {
      setOrders(getStoredOrders());
    }
    setProducts(getStoredProducts());
    setSettings(getStoredSettings());
  };

  React.useEffect(() => {
    if (isOpen) {
      refreshAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      // First try real backend authentication
      await loginApi('admin@aroyal.pk', passwordInput);
      setIsAuthenticated(true);
      await refreshAdminData();
    } catch (err: any) {
      // Also allow direct local master password check
      const correctPassword = getAdminPassword();
      if (passwordInput === correctPassword) {
        setIsAuthenticated(true);
        refreshAdminData();
      } else {
        setAuthError(err.message || 'Invalid Master Password. Please check access credentials.');
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(updated);
      }
    } catch {
      const updated = updateOrderStatus(orderId, newStatus);
      setOrders(updated);
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
      }
    }
    onRefreshParent();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
      try {
        await deleteOrderApi(orderId);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } catch {
        const updated = deleteOrder(orderId);
        setOrders(updated);
      }
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(null);
      }
      onRefreshParent();
    }
  };

  const handleRunEmailTest = async () => {
    setEmailTestStatus({ testing: true });
    try {
      const res = await testEmailApi();
      setEmailTestStatus({ testing: false, success: res.success, message: res.message });
    } catch (err: any) {
      setEmailTestStatus({
        testing: false,
        success: false,
        message: err.message || 'Failed to reach email test endpoint',
      });
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Watches',
      price: 24999,
      old_price: '',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
      description: 'Handcrafted luxury with surgical steel and precision movement.',
      stock: 15,
      featured: false,
      specificationsText: 'Case: 42mm 316L Stainless Steel\nMovement: Precision Japanese Quartz Chronograph\nGlass: Scratch-Resistant Sapphire Crystal\nWaterResistance: 5 ATM\nStrap: Stainless Steel Bracelet',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    const specsString = Object.entries(prod.specifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      old_price: prod.old_price || '',
      image: prod.image,
      description: prod.description,
      stock: prod.stock,
      featured: !!prod.featured,
      specificationsText: specsString,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const specsObj: Record<string, string> = {};
    productForm.specificationsText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (k && v) specsObj[k] = v;
      }
    });

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: productForm.name,
              category: productForm.category,
              price: Number(productForm.price),
              old_price: productForm.old_price ? Number(productForm.old_price) : undefined,
              image: productForm.image,
              description: productForm.description,
              stock: Number(productForm.stock),
              featured: productForm.featured,
              specifications: specsObj,
            }
          : p
      );
    } else {
      const newProd: Product = {
        id: productForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000),
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : undefined,
        image: productForm.image,
        description: productForm.description,
        stock: Number(productForm.stock),
        featured: productForm.featured,
        specifications: specsObj,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newProd, ...products];
    }

    setProducts(updatedList);
    saveStoredProducts(updatedList);
    setIsProductModalOpen(false);
    onRefreshParent();
  };

  const handleDeleteProduct = (prodId: string) => {
    if (confirm('Delete this product from catalog?')) {
      const updated = products.filter((p) => p.id !== prodId);
      setProducts(updated);
      saveStoredProducts(updated);
      onRefreshParent();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(settings);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 2500);
    onRefreshParent();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;
    setAdminPassword(newAdminPassword);
    setPasswordChangedSuccess(true);
    setNewAdminPassword('');
    setTimeout(() => setPasswordChangedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all products and orders to original default demo data?')) {
      resetDemoData();
      setOrders(getStoredOrders());
      setProducts(getStoredProducts());
      setSettings(getStoredSettings());
      onRefreshParent();
      alert('Demo data restored successfully!');
    }
  };

  // Calculations for dashboard
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      o.customer.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#151515] text-[#dfd8cc] flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <div className="bg-[#1f1f1f] border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#8b7650] text-[#151515] flex items-center justify-center font-bold">
            👑
          </div>
          <div>
            <h1 className="font-serif text-base sm:text-lg font-bold text-white tracking-wider flex items-center gap-2">
              <span>{settings.storeName}</span>
              <span className="text-[10px] bg-[#8b7650]/20 text-[#c9ad79] px-2 py-0.5 rounded font-mono border border-[#c9ad79]/30">
                EXECUTIVE PORTAL
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400">Secure Order Processing & Registry System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setOrders(getStoredOrders());
              setProducts(getStoredProducts());
              onRefreshParent();
            }}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded border border-neutral-700 transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#8b7650] hover:bg-[#a48243] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Store className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-1.5 bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-white rounded border border-neutral-700 transition-colors"
              title="Lock Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {!isAuthenticated ? (
        /* Login / Authentication Screen */
        <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-[#151515] to-[#0a0a0a]">
          <div className="max-w-md w-full bg-[#1e1e1e] border border-neutral-800 rounded-xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#8b7650]/10 border border-[#8b7650]/30 text-[#c9ad79] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9ad79]">
                A.ROYAL EXECUTIVE
              </span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">Admin Portal</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your administrative key to access live orders & store controls.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                  Admin Master Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-sm text-white focus:outline-none"
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#8b7650] hover:bg-[#a48243] text-white rounded text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-md"
              >
                Authenticate Access
              </button>
            </form>

            <button
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-60 bg-[#1a1a1a] border-b md:border-b-0 md:border-r border-neutral-800 p-3 sm:p-4 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-x-visible">
            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 w-full">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#8b7650] text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center justify-between transition-colors whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#8b7650] text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders Management</span>
                </div>
                {pendingCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-colors whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#8b7650] text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Catalog & Stock ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#8b7650] text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Security</span>
              </button>
            </div>

            <div className="hidden md:block pt-4 border-t border-neutral-800 text-[11px] text-neutral-500">
              <button
                onClick={handleResetData}
                className="w-full text-left py-2 px-3 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Ledger</span>
              </button>
            </div>
          </aside>

          {/* Main Panel Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#151515]">
            {/* VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1e1e1e] border border-neutral-800 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Total Revenue
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {formatPKR(totalRevenue)}
                    </h3>
                    <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <span>●</span> Real orders ledger
                    </p>
                  </div>

                  <div className="bg-[#1e1e1e] border border-neutral-800 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Total Orders
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {orders.length}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1">Lifetime received</p>
                  </div>

                  <div className="bg-[#1e1e1e] border border-neutral-800 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Pending Orders
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#c9ad79] mt-1">
                      {pendingCount}
                    </h3>
                    <p className="text-[10px] text-amber-400 mt-1">Awaiting dispatch</p>
                  </div>

                  <div className="bg-[#1e1e1e] border border-neutral-800 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Catalog Items
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {products.length}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1">Watches & Perfumes</p>
                  </div>
                </div>

                {/* Quick Inbound Orders Table */}
                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">Recent Inbound Orders</h3>
                      <p className="text-xs text-neutral-400">Latest orders registered by customers across Pakistan</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#c9ad79] hover:underline"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">City</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {orders.slice(0, 6).map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-800/40">
                            <td className="p-3 font-mono font-bold text-white">{order.id}</td>
                            <td className="p-3">
                              <span className="font-semibold text-white block">{order.customer.name}</span>
                              <span className="text-[11px] text-neutral-400">{order.customer.phone}</span>
                            </td>
                            <td className="p-3">{order.customer.city}</td>
                            <td className="p-3">{order.items.length} items</td>
                            <td className="p-3 font-bold text-white">{formatPKR(order.total)}</td>
                            <td className="p-3">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                className={`text-[11px] font-bold py-1 px-2 rounded border focus:outline-none ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : order.status === 'Shipped'
                                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                                    : 'bg-amber-950 text-amber-300 border-amber-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-white">Order Registry & Fulfillment</h2>
                    <p className="text-xs text-neutral-400">Total {orders.length} orders in local database</p>
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-[#8b7650] text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer name, phone, city..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#8b7650]"
                  />
                </div>

                {/* Orders Table */}
                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-3.5">Order ID & Date</th>
                          <th className="p-3.5">Customer Details</th>
                          <th className="p-3.5">Address & City</th>
                          <th className="p-3.5">Items Ordered</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Payment</th>
                          <th className="p-3.5">Fulfillment Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-neutral-500 text-xs">
                              No orders match your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-neutral-800/40">
                              <td className="p-3.5 font-mono">
                                <span className="font-bold text-white block">{order.id}</span>
                                <span className="text-[10px] text-neutral-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-semibold text-white block">{order.customer.name}</span>
                                <span className="text-[11px] text-neutral-400 block">{order.customer.phone}</span>
                              </td>
                              <td className="p-3.5 max-w-xs truncate">
                                <span className="font-medium text-white block">{order.customer.city}</span>
                                <span className="text-[11px] text-neutral-400 block truncate">
                                  {order.customer.address}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-semibold text-white block">{order.items.length} items</span>
                                <span className="text-[11px] text-neutral-400 truncate block max-w-[120px]">
                                  {order.items.map((i) => i.name).join(', ')}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold text-white whitespace-nowrap">
                                {formatPKR(order.total)}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="text-[11px] block">{order.paymentMethod}</span>
                                <span className={`text-[10px] font-bold uppercase ${
                                  order.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-neutral-400'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                  className={`text-[11px] font-bold py-1 px-2.5 rounded border focus:outline-none ${
                                    order.status === 'Delivered'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : order.status === 'Shipped'
                                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                                      : order.status === 'Cancelled'
                                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                                      : 'bg-amber-950 text-amber-300 border-amber-800'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded"
                                  title="View Invoice & Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${order.customer.name}, this is A.ROYAL Luxury Concierge regarding your order ${order.id}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-emerald-900/60 text-emerald-400 rounded inline-block"
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 rounded"
                                  title="Delete order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: INVENTORY / PRODUCTS */}
            {activeTab === 'inventory' && (
              <div className="space-y-4 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-white">Catalog & Stock Management</h2>
                    <p className="text-xs text-neutral-400">Manage timepieces and fragrances catalog</p>
                  </div>
                  <button
                    onClick={openNewProductModal}
                    className="py-2 px-4 bg-[#8b7650] hover:bg-[#a48243] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Item</span>
                  </button>
                </div>

                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-3.5">Product</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Price (PKR)</th>
                          <th className="p-3.5">Inventory Stock</th>
                          <th className="p-3.5">Featured</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-neutral-800/40">
                            <td className="p-3.5 flex items-center gap-3">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-12 object-cover rounded bg-neutral-800 border border-neutral-700"
                              />
                              <div>
                                <span className="font-bold text-white block">{prod.name}</span>
                                <span className="text-[11px] text-neutral-400 truncate max-w-xs block">
                                  {prod.description}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">{prod.category}</td>
                            <td className="p-3.5 font-bold text-white">
                              {formatPKR(prod.price)}
                              {prod.old_price && (
                                <span className="text-neutral-500 line-through text-[11px] ml-1.5 block">
                                  {formatPKR(prod.old_price)}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className={`font-semibold ${
                                prod.stock > 5 ? 'text-emerald-400' : prod.stock > 0 ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {prod.stock} Units
                              </span>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => {
                                  const updated = products.map((p) =>
                                    p.id === prod.id ? { ...p, featured: !p.featured } : p
                                  );
                                  setProducts(updated);
                                  saveStoredProducts(updated);
                                  onRefreshParent();
                                }}
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                  prod.featured
                                    ? 'bg-amber-950 text-[#c9ad79] border-amber-800'
                                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                }`}
                              >
                                {prod.featured ? 'Featured' : 'Standard'}
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => openEditProductModal(prod)}
                                className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded"
                                title="Edit Item"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 rounded"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Store Branding Settings */}
                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-white">Storefront & WhatsApp Concierge</h3>

                  {settingsSavedSuccess && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
                      <Check className="w-4 h-4" /> Settings updated successfully!
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-neutral-400 uppercase mb-1">
                          Store Brand Name
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-[#8b7650]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-neutral-400 uppercase mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={settings.tagline}
                          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-[#8b7650]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-neutral-400 uppercase mb-1">
                          WhatsApp Orders Hotline (for 1-click customer chat)
                        </label>
                        <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-[#8b7650]"
                        />
                        <span className="text-[10px] text-neutral-500">Include country code (e.g. +923001234567)</span>
                      </div>
                      <div>
                        <label className="block font-bold text-neutral-400 uppercase mb-1">
                          Free Insured Shipping Threshold (PKR)
                        </label>
                        <input
                          type="number"
                          value={settings.freeShippingThreshold}
                          onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-[#8b7650]"
                        />
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="pt-4 border-t border-neutral-800 space-y-3">
                      <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                        Direct Bank Transfer Account (Meezan / Raast)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-neutral-400 uppercase mb-1">Bank Name</label>
                          <input
                            type="text"
                            value={settings.bankDetails.bankName}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                              })
                            }
                            className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-400 uppercase mb-1">Account Title</label>
                          <input
                            type="text"
                            value={settings.bankDetails.accountTitle}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                bankDetails: { ...settings.bankDetails, accountTitle: e.target.value },
                              })
                            }
                            className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-400 uppercase mb-1">Account Number</label>
                          <input
                            type="text"
                            value={settings.bankDetails.accountNumber}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                bankDetails: { ...settings.bankDetails, accountNumber: e.target.value },
                              })
                            }
                            className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-400 uppercase mb-1">IBAN</label>
                          <input
                            type="text"
                            value={settings.bankDetails.iban}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                bankDetails: { ...settings.bankDetails, iban: e.target.value },
                              })
                            }
                            className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-[#8b7650] hover:bg-[#a48243] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                    >
                      Save Storefront Settings
                    </button>
                  </form>
                </div>

                {/* Real Gmail Order Notification Dispatch Engine */}
                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#c9ad79]" />
                        <span>Real Gmail Order Notifications Relay</span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Dispatches automated order confirmation to customer and alert to admin Gmail ({settings.adminEmail}).
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#8b7650]/20 text-[#c9ad79] border border-[#c9ad79]/30">
                      Nodemailer Engine Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-900 p-4 rounded border border-neutral-800">
                    <div>
                      <span className="text-neutral-500 block">Customer Invoices:</span>
                      <strong className="text-white">Automated on Checkout</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Admin Notification Inbox:</span>
                      <strong className="text-[#c9ad79]">{settings.adminEmail}</strong>
                    </div>
                  </div>

                  {emailTestStatus.message && (
                    <div
                      className={`p-3 rounded text-xs flex items-center gap-2 border ${
                        emailTestStatus.success
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-800 text-amber-300'
                      }`}
                    >
                      {emailTestStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{emailTestStatus.message}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={emailTestStatus.testing}
                      onClick={handleRunEmailTest}
                      className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {emailTestStatus.testing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c9ad79]" />
                          <span>Testing SMTP Server...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#c9ad79]" />
                          <span>Test SMTP Connection & Credentials</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-neutral-500">
                      Configured via SMTP_USER & SMTP_PASS (Google App Password)
                    </span>
                  </div>
                </div>

                {/* Security Passcode Change */}
                <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-white">Admin Console Password</h3>
                  <p className="text-xs text-neutral-400">Change your master password to secure order fulfillment.</p>

                  {passwordChangedSuccess && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
                      <Check className="w-4 h-4" /> Password changed successfully!
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="flex gap-2 max-w-md">
                    <input
                      type="password"
                      placeholder="New Admin Password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="flex-1 p-2.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-[#8b7650]"
                    />
                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-700"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-serif text-base font-bold text-white">
                {editingProduct ? 'Edit Catalog Item' : 'Add New Item to Catalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block font-bold text-neutral-400 uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Chronograph Black"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-[#8b7650]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-400 uppercase mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as Product['category'] })
                    }
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                  >
                    <option value="Watches">Watches</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-400 uppercase mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-400 uppercase mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-400 uppercase mb-1">Original Price (Strike-through)</label>
                  <input
                    type="number"
                    placeholder="e.g. 29999"
                    value={productForm.old_price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, old_price: e.target.value ? Number(e.target.value) : '' })
                    }
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-400 uppercase mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-400 uppercase mb-1">
                  Specifications / Notes (One per line: Key: Value)
                </label>
                <textarea
                  rows={4}
                  value={productForm.specificationsText}
                  onChange={(e) => setProductForm({ ...productForm, specificationsText: e.target.value })}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-700 rounded text-white font-mono text-[11px] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="rounded text-[#8b7650] focus:ring-[#8b7650]"
                />
                <span className="text-neutral-300">Feature prominently on storefront hero & curated showcase</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-[#8b7650] hover:bg-[#a48243] text-white rounded font-bold uppercase tracking-wider"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Order Full Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] text-[#c9ad79] font-bold uppercase tracking-widest block">
                  Customer Order
                </span>
                <h3 className="font-serif text-xl font-bold text-white">{selectedOrderDetails.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-neutral-900 p-3.5 rounded border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Customer</span>
                  <strong className="text-white font-semibold text-sm">{selectedOrderDetails.customer.name}</strong>
                  <span className="block text-neutral-400">{selectedOrderDetails.customer.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Shipping Address</span>
                  <strong className="text-white font-semibold">{selectedOrderDetails.customer.city}</strong>
                  <span className="block text-neutral-400">{selectedOrderDetails.customer.address}</span>
                </div>
                {selectedOrderDetails.customer.notes && (
                  <div className="col-span-2 pt-1 border-t border-neutral-800 text-neutral-300">
                    <span className="text-neutral-500 block">Notes:</span>
                    <span>{selectedOrderDetails.customer.notes}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-neutral-400 uppercase text-[10px] font-bold tracking-wider block mb-2">
                  Ordered Products
                </span>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2.5 bg-neutral-900 rounded border border-neutral-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-12 object-cover rounded bg-neutral-800"
                        />
                        <div>
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-neutral-400 text-[11px]">
                            Qty: {item.quantity} × {formatPKR(item.price)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-white">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span>{formatPKR(selectedOrderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-400 uppercase">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-neutral-800">
                  <span>Grand Total:</span>
                  <span>{formatPKR(selectedOrderDetails.total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Status:</span>
                  <select
                    value={selectedOrderDetails.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrderDetails.id, e.target.value as Order['status'])
                    }
                    className="p-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${selectedOrderDetails.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${selectedOrderDetails.customer.name}, A.ROYAL Concierge update regarding Order ${selectedOrderDetails.id}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
