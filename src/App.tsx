import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustFeatures } from './components/TrustFeatures';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { Footer } from './components/Footer';
import { BottomAdminSection } from './components/BottomAdminSection';
import { AiChatbot } from './components/AiChatbot';

import { Product, OrderItem, Order, StoreSettings } from './data/initialData';
import {
  getStoredProducts,
  getStoredSettings,
} from './utils/storage';
import { fetchProducts, fetchStoreSettings } from './utils/api';
import { SlidersHorizontal, Sparkles, Watch, Flame, Check } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings());

  // Category & Filter state
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Modals & Panels state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string>('');

  // Cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('aroyal_cart_items_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync products and settings on mount
  const refreshData = async () => {
    try {
      const liveProducts = await fetchProducts();
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      } else {
        setProducts(getStoredProducts());
      }
    } catch {
      setProducts(getStoredProducts());
    }

    try {
      const liveSettings = await fetchStoreSettings();
      if (liveSettings) setSettings(liveSettings);
    } catch {
      setSettings(getStoredSettings());
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aroyal_cart_items_v2', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity,
          image: product.image,
        },
      ];
    });
    showToast(`Added "${product.name}" to your shopping bag.`);
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    // Add to cart if not present then open checkout
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity } : i
        );
      }
      return [
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity,
          image: product.image,
        },
      ];
    });
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // Clear bag upon successful purchase
    setCartItems([]);
    refreshData();
    showToast(`Royal Order ${order.id} confirmed successfully!`);
  };

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          Object.values(p.specifications).some((val) => val.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // 'featured'
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#151515]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151515] text-[#dfd8cc] border border-[#c9ad79] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <div className="w-5 h-5 rounded-full bg-[#8b7650] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTrack={() => {
          setTrackOrderId('');
          setIsTrackOpen(true);
        }}
        onOpenAdmin={() => {
          window.dispatchEvent(new CustomEvent('open-bottom-admin'));
        }}
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <Hero
        onExploreWatches={() => {
          setActiveCategory('Watches');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExplorePerfumes={() => {
          setActiveCategory('Perfumes');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={(productId) => {
          const prod = products.find((p) => p.id === productId);
          if (prod) setQuickViewProduct(prod);
        }}
      />

      {/* Trust & Heritage Pillars */}
      <TrustFeatures />

      {/* Main Catalog Showcase */}
      <section id="catalog-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#dfd8cc]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8b7650] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              The Atelier Collection
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#151515] tracking-tight">
              Curated Timepieces & Extraits
            </h2>
            <p className="text-xs sm:text-sm text-[#666] mt-1 max-w-xl">
              Each piece represents singular devotion to master craftsmanship, enduring horological precision, and olfactive majesty.
            </p>
          </div>

          {/* Category Tabs & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === 'All'
                  ? 'bg-[#151515] text-[#faf9f6] shadow-sm'
                  : 'bg-white text-[#555] hover:text-[#151515] border border-[#dfd8cc]'
              }`}
            >
              All Pieces ({products.length})
            </button>

            <button
              onClick={() => setActiveCategory('Watches')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === 'Watches'
                  ? 'bg-[#151515] text-[#faf9f6] shadow-sm'
                  : 'bg-white text-[#555] hover:text-[#151515] border border-[#dfd8cc]'
              }`}
            >
              <Watch className="w-3.5 h-3.5 text-[#8b7650]" />
              <span>Watches</span>
            </button>

            <button
              onClick={() => setActiveCategory('Perfumes')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === 'Perfumes'
                  ? 'bg-[#151515] text-[#faf9f6] shadow-sm'
                  : 'bg-white text-[#555] hover:text-[#151515] border border-[#dfd8cc]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#8b7650]" />
              <span>Perfumes & Oud</span>
            </button>
          </div>
        </div>

        {/* Filter bar: search feedback + Sort dropdown */}
        <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            {searchQuery ? (
              <span>
                Showing results for <strong className="text-black">"{searchQuery}"</strong> ({displayedProducts.length} items found)
              </span>
            ) : (
              <span>
                Showing {displayedProducts.length} handcrafted items in {activeCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8b7650]" />
            <span className="font-semibold text-neutral-600">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#dfd8cc] rounded px-2.5 py-1.5 text-xs text-[#151515] focus:outline-none focus:border-[#8b7650]"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {displayedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-[#dfd8cc] p-8">
            <h3 className="font-serif text-xl font-bold text-[#151515]">No Masterpieces Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              We couldn't find items matching your criteria. Try adjusting your search query or view all available categories.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[#151515] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#8b7650] transition-colors"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={setQuickViewProduct}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onBuyNow={(p) => handleBuyNow(p, 1)}
                whatsappNumber={settings.whatsappNumber}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick View Product Modal */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onBuyNow={(p, q) => handleBuyNow(p, q)}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => setIsCheckoutOpen(true)}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
        settings={settings}
        onOpenTrackWithId={(id) => {
          setTrackOrderId(id);
          setIsTrackOpen(true);
        }}
      />

      {/* Track Order Portal */}
      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        initialOrderId={trackOrderId}
        settings={settings}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTrack={() => {
          setTrackOrderId('');
          setIsTrackOpen(true);
        }}
        onOpenAdmin={() => {
          window.dispatchEvent(new CustomEvent('open-bottom-admin'));
        }}
      />

      {/* Dedicated Admin Panel Section placed at the very bottom after main content and footer */}
      <BottomAdminSection
        settings={settings}
        onRefreshParent={refreshData}
      />

      {/* Floating AI Customer Support Concierge */}
      <AiChatbot />
    </div>
  );
}
