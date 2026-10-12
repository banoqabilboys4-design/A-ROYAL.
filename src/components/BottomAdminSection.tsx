import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  ShieldCheck,
  RotateCcw,
  Search,
  MessageCircle,
  Printer,
  Trash2,
  Mail,
  Phone,
  Eye,
  AlertCircle,
  Loader2,
  Send,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Edit3,
  Package,
  ShoppingBag,
  Tag,
  Check,
} from 'lucide-react';
import { Order, Product, StoreSettings } from '../data/initialData';
import {
  loginApi,
  fetchAdminOrders,
  updateOrderStatusApi,
  deleteOrderApi,
  fetchAdminAnalytics,
  testEmailApi,
  fetchProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../utils/api';
import { formatPKR } from '../utils/storage';

interface BottomAdminSectionProps {
  settings: StoreSettings;
  onRefreshParent: () => void;
}

export const BottomAdminSection: React.FC<BottomAdminSectionProps> = ({
  settings,
  onRefreshParent,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Active Admin Sub-Tab: 'orders' | 'items'
  const [activeTab, setActiveTab] = useState<'orders' | 'items'>('orders');

  // Auth inputs
  const [emailInput, setEmailInput] = useState('admin@aroyal.pk');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Orders and analytics state
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Products / Items state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Item Edit / Add Modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [itemSaveLoading, setItemSaveLoading] = useState(false);
  const [itemSaveError, setItemSaveError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Email test
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('aroyal_auth_token');
    if (token) {
      loadAdminDashboardData();
    }
  }, []);

  // Listen to external click triggers from Navbar or Footer
  useEffect(() => {
    const handleOpenAdminTrigger = () => {
      if (!isAuthenticated) {
        setShowLoginModal(true);
      } else {
        setIsExpanded(true);
      }
      setTimeout(() => {
        document.getElementById('bottom-admin-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    window.addEventListener('open-bottom-admin', handleOpenAdminTrigger);
    return () => window.removeEventListener('open-bottom-admin', handleOpenAdminTrigger);
  }, [isAuthenticated]);

  const loadAdminDashboardData = async () => {
    setLoadingOrders(true);
    setLoadingProducts(true);
    try {
      const [ordersRes, analyticsRes, prods] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminAnalytics(),
        fetchProducts(),
      ]);
      setOrders(ordersRes.orders);
      setAnalytics(analyticsRes);
      setProducts(prods);
      setIsAuthenticated(true);
      setAuthError('');
    } catch {
      // Token expired or invalid
      setIsAuthenticated(false);
    } finally {
      setLoadingOrders(false);
      setLoadingProducts(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      await loginApi(emailInput, passwordInput);
      await loadAdminDashboardData();
      setShowLoginModal(false);
      setIsExpanded(true);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aroyal_auth_token');
    setIsAuthenticated(false);
    setIsExpanded(false);
    setOrders([]);
    setProducts([]);
    setAnalytics(null);
    setPasswordInput('');
  };

  // ==============================
  // ORDER ACTIONS
  // ==============================
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      fetchAdminAnalytics().then(setAnalytics).catch(() => {});
      onRefreshParent();
      showToast(`Order ${orderId} updated to ${newStatus}`);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm(`Are you sure you want to permanently delete order ${orderId}?`)) return;
    try {
      await deleteOrderApi(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      fetchAdminAnalytics().then(setAnalytics).catch(() => {});
      onRefreshParent();
      showToast(`Order ${orderId} deleted`);
    } catch (err: any) {
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  const handleTestEmail = async () => {
    setEmailTesting(true);
    setEmailTestResult(null);
    try {
      const res = await testEmailApi();
      setEmailTestResult(res);
    } catch (err: any) {
      setEmailTestResult({ success: false, message: err.message || 'Test failed' });
    } finally {
      setEmailTesting(false);
    }
  };

  // ==============================
  // ITEM / PRODUCT CRUD ACTIONS
  // ==============================
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsNewProduct(false);
    setItemSaveError('');
  };

  const handleOpenAddProduct = () => {
    setEditingProduct({
      name: '',
      category: 'Watches',
      price: 15000,
      old_price: 18000,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
      description: 'Handcrafted luxury piece with precision finishing.',
      featured: false,
      specifications: {},
    });
    setIsNewProduct(true);
    setItemSaveError('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name || !editingProduct.price || !editingProduct.image) {
      setItemSaveError('Please provide item name, price, and image URL.');
      return;
    }

    setItemSaveLoading(true);
    setItemSaveError('');

    try {
      if (isNewProduct) {
        const created = await createProductApi(editingProduct);
        setProducts((prev) => [created, ...prev]);
        showToast(`Item "${created.name}" successfully created!`);
      } else if (editingProduct.id) {
        const updated = await updateProductApi(editingProduct.id, editingProduct);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Item "${updated.name}" updated successfully!`);
      }

      setEditingProduct(null);
      // Trigger live storefront update in parent component
      onRefreshParent();
      // Refresh analytics
      fetchAdminAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      setItemSaveError(err.message || 'Failed to save product in database.');
    } finally {
      setItemSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) return;

    try {
      await deleteProductApi(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      onRefreshParent();
      fetchAdminAnalytics().then(setAnalytics).catch(() => {});
      showToast(`Item "${productName}" removed from catalog.`);
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <section
      id="bottom-admin-panel"
      className="bg-[#0e0e0e] text-[#dfd8cc] border-t border-neutral-800 transition-all duration-300 relative"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 bg-[#1a1a1a] text-white border border-[#c9ad79] px-3.5 py-2 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CHHOTA SA (COMPACT) BOTTOM STRIP */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        {/* Left: Discreet Branding & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 rounded bg-[#8b7650]/20 text-[#c9ad79] flex items-center justify-center border border-[#8b7650]/30">
            <Lock className="w-2.5 h-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300 text-[11px] tracking-wide">
              Admin Console
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
                <span>|</span>
                <span>
                  Orders: <strong className="text-white">{orders.length}</strong>
                </span>
                <span>|</span>
                <span>
                  Items in Catalog: <strong className="text-[#c9ad79]">{products.length}</strong>
                </span>
                <span>|</span>
                <span>
                  Sales: <strong className="text-white">{formatPKR(analytics?.totalRevenue || 0)}</strong>
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-neutral-500">
                Restricted Atelier Portal
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Expand Toggle */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-[#8b7650] hover:text-white text-neutral-300 rounded text-[11px] font-semibold border border-neutral-700/80 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3 h-3 text-[#c9ad79]" />
              <span>Admin Login</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={loadAdminDashboardData}
                disabled={loadingOrders || loadingProducts}
                title="Sync database records"
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition-colors disabled:opacity-50"
              >
                <RotateCcw
                  className={`w-3 h-3 ${loadingOrders || loadingProducts ? 'animate-spin text-[#c9ad79]' : ''}`}
                />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1 bg-[#8b7650] hover:bg-[#a48243] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Minimize</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>Open Panel ({orders.length} orders / {products.length} items)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 rounded border border-neutral-800 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. EXPANDED VIEW (When Admin Unlocks & Expands) */}
      {isAuthenticated && isExpanded && (
        <div className="border-t border-neutral-800 bg-[#121212] px-3 sm:px-6 py-6 space-y-5 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Top Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Total Sales
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                  {formatPKR(analytics?.totalRevenue || 0)}
                </p>
              </div>

              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  All Orders
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {orders.length}
                </p>
              </div>

              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Pending Orders
                </span>
                <p className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
                  {orders.filter((o) => o.status === 'Pending').length}
                </p>
              </div>

              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Dispatched
                </span>
                <p className="text-sm sm:text-base font-bold text-blue-400 mt-0.5">
                  {orders.filter((o) => o.status === 'Shipped').length}
                </p>
              </div>

              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Delivered
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                  {orders.filter((o) => o.status === 'Delivered').length}
                </p>
              </div>

              <div className="bg-[#181818] border border-neutral-800/80 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Store Items
                </span>
                <p className="text-sm sm:text-base font-bold text-[#c9ad79] mt-0.5">
                  {products.length}
                </p>
              </div>
            </div>

            {/* Notification & Config Compact Strip */}
            <div className="bg-[#181818] border border-neutral-800/80 rounded-lg px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-neutral-300 text-[11px]">
                <span className="flex items-center gap-1 text-[#c9ad79] font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Admin Email:</span>
                  <strong className="text-white">wahab.nadeem6040@gmail.com</strong>
                </span>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-[#c9ad79] font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Admin Phone:</span>
                  <strong className="text-white">03110706379</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTestEmail}
                  disabled={emailTesting}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-[11px] font-medium rounded border border-neutral-700/80 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {emailTesting ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#c9ad79]" />
                  ) : (
                    <Send className="w-3 h-3 text-[#c9ad79]" />
                  )}
                  <span>Test SMTP</span>
                </button>
              </div>
            </div>

            {emailTestResult && (
              <div
                className={`p-2.5 rounded text-xs flex items-center gap-2 border ${
                  emailTestResult.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300'
                }`}
              >
                {emailTestResult.success ? (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{emailTestResult.message}</span>
              </div>
            )}

            {/* TAB SELECTION STRIP: Orders vs Catalog Items */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-[#8b7650] text-white shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Orders & Fulfillment ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    activeTab === 'items'
                      ? 'bg-[#8b7650] text-white shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Items & Inventory Management ({products.length})</span>
                </button>
              </div>

              {activeTab === 'items' && (
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Item</span>
                </button>
              )}
            </div>

            {/* VIEW A: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-medium tracking-wide transition-colors ${
                            statusFilter === st
                              ? 'bg-[#8b7650] text-white'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search order ID, phone, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded text-xs text-white focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-[#181818] border border-neutral-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[9px] tracking-wider border-b border-neutral-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5">Order ID</th>
                          <th className="p-2.5">Customer & Phone</th>
                          <th className="p-2.5">City & Address</th>
                          <th className="p-2.5">Products</th>
                          <th className="p-2.5">Total</th>
                          <th className="p-2.5">Payment</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Email Status</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-6 text-center text-neutral-500 text-xs">
                              {orders.length === 0
                                ? 'No orders in database yet. New checkout orders will appear here automatically.'
                                : 'No orders matching current filter.'}
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-neutral-800/50 transition-colors">
                              <td className="p-2.5 font-mono">
                                <span className="font-bold text-white block">{order.id}</span>
                                <span className="text-[9px] text-neutral-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </td>

                              <td className="p-2.5">
                                <span className="font-semibold text-white block">{order.customer.name}</span>
                                <span className="text-[10px] text-[#c9ad79] font-mono">{order.customer.phone}</span>
                              </td>

                              <td className="p-2.5 max-w-[150px]">
                                <span className="font-semibold text-white block">{order.customer.city}</span>
                                <span className="text-[10px] text-neutral-400 truncate block">
                                  {order.customer.address}
                                </span>
                              </td>

                              <td className="p-2.5 max-w-[140px]">
                                <span className="text-[11px] text-neutral-300 block truncate">
                                  {order.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                                </span>
                              </td>

                              <td className="p-2.5 font-bold text-white whitespace-nowrap">
                                {formatPKR(order.total)}
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-[10px]">
                                <span>{order.paymentMethod}</span>
                              </td>

                              <td className="p-2.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className={`text-[10px] font-bold py-1 px-2 rounded border focus:outline-none ${
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

                              <td className="p-2.5 whitespace-nowrap text-[10px]">
                                <span
                                  className={`font-bold uppercase ${
                                    order.emailNotificationStatus?.admin === 'sent'
                                      ? 'text-emerald-400'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {order.emailNotificationStatus?.admin || 'not_configured'}
                                </span>
                              </td>

                              <td className="p-2.5 text-right whitespace-nowrap space-x-1">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-1 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded"
                                  title="Inspect Order"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Assalam-o-Alaikum ${order.customer.name}, A.ROYAL update regarding your Order ${order.id}. Current status: ${order.status}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-emerald-900/60 text-emerald-400 rounded inline-block"
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="p-1 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 rounded"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

            {/* VIEW B: ITEMS & INVENTORY MANAGEMENT (ITEM CHANGE / EDIT) */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                {/* Search and Category Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Watches', 'Perfumes'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setProductCategoryFilter(cat)}
                        className={`px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors ${
                          productCategoryFilter === cat
                            ? 'bg-[#8b7650] text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search items by name, notes..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded text-xs text-white focus:outline-none focus:border-[#8b7650]"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-[#181818] border border-neutral-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[9px] tracking-wider border-b border-neutral-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Current Price</th>
                          <th className="p-2.5">Original (Old) Price</th>
                          <th className="p-2.5">Stock Available</th>
                          <th className="p-2.5">Featured</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-neutral-500 text-xs">
                              No items found matching the filter.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-neutral-800/50 transition-colors">
                              <td className="p-2.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-9 h-11 object-cover rounded bg-neutral-800 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-white block">{prod.name}</span>
                                    <span className="text-[10px] text-neutral-400 max-w-[220px] truncate block">
                                      {prod.description}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-2.5">
                                <span className="bg-neutral-900 border border-neutral-700 text-[#c9ad79] text-[10px] font-semibold px-2 py-0.5 rounded">
                                  {prod.category}
                                </span>
                              </td>

                              <td className="p-2.5 font-bold text-white whitespace-nowrap">
                                {formatPKR(prod.price)}
                              </td>

                              <td className="p-2.5 text-neutral-400 whitespace-nowrap text-[11px]">
                                {prod.old_price ? formatPKR(prod.old_price) : '—'}
                              </td>

                              <td className="p-2.5 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    prod.stock > 10
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : prod.stock > 0
                                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                                  }`}
                                >
                                  {prod.stock > 0 ? `${prod.stock} units` : 'Sold out'}
                                </span>
                              </td>

                              <td className="p-2.5">
                                {prod.featured ? (
                                  <span className="text-emerald-400 text-[10px] font-semibold">★ Yes</span>
                                ) : (
                                  <span className="text-neutral-500 text-[10px]">No</span>
                                )}
                              </td>

                              <td className="p-2.5 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="px-2.5 py-1 bg-neutral-800 hover:bg-[#8b7650] hover:text-white text-neutral-300 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1 border border-neutral-700"
                                  title="Edit Item Details & Price"
                                >
                                  <Edit3 className="w-3 h-3 text-[#c9ad79]" />
                                  <span>Edit Item</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 rounded transition-colors inline-block"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* 3. ITEM EDIT & ADD MODAL (Change Item / Product Modal) */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 text-xs text-neutral-200 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#8b7650]/20 text-[#c9ad79] flex items-center justify-center border border-[#8b7650]/30">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    {isNewProduct ? 'Add New Catalog Item' : `Edit Item: ${editingProduct.name}`}
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    Changes save to database and sync to live storefront
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemSaveError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{itemSaveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Royal Chronograph Silver"
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                />
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category || 'Watches'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as 'Watches' | 'Perfumes' | 'Accessories',
                      })
                    }
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  >
                    <option value="Watches">Watches</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock ?? 10}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Old Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Current Selling Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    placeholder="24999"
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none font-semibold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Original Price (Optional strikethrough)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.old_price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        old_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="29999"
                    className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Image URL *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  />
                  {editingProduct.image && (
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-9 h-10 object-cover rounded bg-neutral-800 shrink-0 border border-neutral-700"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Detailed horological or fragrance description..."
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={!!editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                  className="rounded bg-neutral-900 border-neutral-700 text-[#8b7650] focus:ring-0"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-neutral-300">
                  Feature this item on homepage showcase
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={itemSaveLoading}
                  className="px-4 py-1.5 rounded bg-[#8b7650] hover:bg-[#a48243] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {itemSaveLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isNewProduct ? 'Create Item' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. COMPACT POPUP LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#8b7650]/20 text-[#c9ad79] flex items-center justify-center border border-[#8b7650]/40">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Admin Authentication</h3>
                <span className="text-[10px] text-neutral-400">Restricted staff console access</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  placeholder="admin@aroyal.pk"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-2 bg-neutral-900 border border-neutral-700 focus:border-[#8b7650] rounded text-xs text-white focus:outline-none"
                  placeholder="Password..."
                />
              </div>

              {authError && (
                <div className="p-2 bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] rounded flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2 bg-[#8b7650] hover:bg-[#a48243] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. DETAIL INSPECTION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-3.5 text-xs text-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div>
                <span className="text-[9px] text-[#c9ad79] font-bold uppercase tracking-widest block">
                  Order Inspection
                </span>
                <h3 className="font-serif text-lg font-bold text-white">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-3 rounded border border-neutral-800 text-[11px]">
              <div>
                <span className="text-neutral-500 block">Customer</span>
                <strong className="text-white block">{selectedOrder.customer.name}</strong>
                <span className="text-neutral-400 font-mono block">{selectedOrder.customer.phone}</span>
                {selectedOrder.customer.email && (
                  <span className="text-neutral-400 block truncate">{selectedOrder.customer.email}</span>
                )}
              </div>
              <div>
                <span className="text-neutral-500 block">Destination</span>
                <strong className="text-white block">{selectedOrder.customer.city}</strong>
                <span className="text-neutral-400 block">{selectedOrder.customer.address}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-neutral-400 uppercase text-[9px] font-bold tracking-wider block">
                Products ({selectedOrder.items.length})
              </span>
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-neutral-900 rounded border border-neutral-800 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-10 object-cover rounded bg-neutral-800"
                    />
                    <div>
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-neutral-400 text-[10px]">
                        Qty: {item.quantity} × {formatPKR(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatPKR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800 space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span>{formatPKR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping:</span>
                <span className="text-emerald-400 uppercase font-semibold">Free Insured Courier</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-neutral-800">
                <span>Grand Total:</span>
                <span>{formatPKR(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-bold uppercase text-[9px]">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="p-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
