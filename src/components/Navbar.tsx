import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Crown, MessageCircle, Lock, Truck } from 'lucide-react';
import { StoreSettings } from '../data/initialData';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenTrack: () => void;
  onOpenAdmin?: () => void;
  settings: StoreSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  activeCategory,
  onSelectCategory,
  onOpenTrack,
  onOpenAdmin,
  settings,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cleanHotline = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#dfd8cc]/80 transition-all">
      {/* Top Announcement Ribbon */}
      <div className="bg-[#151515] text-[#dfd8cc] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wider flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-[#c9ad79]">
          <Truck className="w-3.5 h-3.5 inline" />
          Complimentary Insured Delivery Across Pakistan
        </span>
        <span className="hidden sm:inline text-neutral-500">•</span>
        <span className="hidden sm:inline">Cash on Delivery (COD) Available</span>
        <span className="hidden md:inline text-neutral-500">•</span>
        <span className="hidden md:inline text-[#c9ad79]">7-Day VIP Exchange</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#151515] hover:text-[#8b7650] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo Brand */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
            <button
              onClick={() => onSelectCategory('All')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded bg-[#151515] text-[#c9ad79] flex items-center justify-center shadow-sm border border-[#c9ad79]/30 group-hover:border-[#c9ad79] transition-colors">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#151515] block uppercase leading-none">
                  {settings.storeName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#8b7650] font-semibold block mt-1">
                  {settings.tagline}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => onSelectCategory('All')}
              className={`text-xs uppercase tracking-[0.18em] font-semibold transition-colors py-1 relative ${
                activeCategory === 'All' ? 'text-[#8b7650]' : 'text-[#333] hover:text-[#8b7650]'
              }`}
            >
              Home
              {activeCategory === 'All' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8b7650] rounded-full" />
              )}
            </button>
            <button
              onClick={() => onSelectCategory('Watches')}
              className={`text-xs uppercase tracking-[0.18em] font-semibold transition-colors py-1 relative ${
                activeCategory === 'Watches' ? 'text-[#8b7650]' : 'text-[#333] hover:text-[#8b7650]'
              }`}
            >
              Watches
              {activeCategory === 'Watches' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8b7650] rounded-full" />
              )}
            </button>
            <button
              onClick={() => onSelectCategory('Perfumes')}
              className={`text-xs uppercase tracking-[0.18em] font-semibold transition-colors py-1 relative ${
                activeCategory === 'Perfumes' ? 'text-[#8b7650]' : 'text-[#333] hover:text-[#8b7650]'
              }`}
            >
              Perfumes
              {activeCategory === 'Perfumes' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8b7650] rounded-full" />
              )}
            </button>
            <button
              onClick={onOpenTrack}
              className="text-xs uppercase tracking-[0.18em] font-semibold text-[#333] hover:text-[#8b7650] transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
              Track Order
            </button>
          </nav>

          {/* Action Items */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Toggle / Input */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border border-[#c9ad79] rounded px-2.5 py-1.5 shadow-sm w-44 sm:w-60">
                  <Search className="w-4 h-4 text-[#8b7650] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search watches, notes..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-[#151515] placeholder-neutral-400 focus:outline-none ml-2"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#151515] hover:text-[#8b7650] hover:bg-neutral-100/60 rounded-full transition-colors"
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* WhatsApp Concierge direct button */}
            <a
              href={`https://wa.me/${cleanHotline}?text=${encodeURIComponent('Assalam-o-Alaikum, I need assistance with A.ROYAL collections.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all"
              title="Chat with Royal Concierge"
            >
              <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
              <span className="hidden md:inline">WhatsApp Concierge</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-[#151515] text-[#dfd8cc] hover:bg-[#8b7650] rounded transition-all flex items-center gap-2 group shadow-sm"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#c9ad79] group-hover:text-white transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#8b7650] group-hover:bg-[#151515] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#dfd8cc] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm uppercase tracking-wider font-semibold rounded ${
                activeCategory === 'All' ? 'bg-[#faf9f6] text-[#8b7650]' : 'text-[#333]'
              }`}
            >
              Home / All Collections
            </button>
            <button
              onClick={() => {
                onSelectCategory('Watches');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm uppercase tracking-wider font-semibold rounded ${
                activeCategory === 'Watches' ? 'bg-[#faf9f6] text-[#8b7650]' : 'text-[#333]'
              }`}
            >
              Precision Watches
            </button>
            <button
              onClick={() => {
                onSelectCategory('Perfumes');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm uppercase tracking-wider font-semibold rounded ${
                activeCategory === 'Perfumes' ? 'bg-[#faf9f6] text-[#8b7650]' : 'text-[#333]'
              }`}
            >
              Haute Parfumerie & Oud
            </button>
            <button
              onClick={() => {
                onOpenTrack();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm uppercase tracking-wider font-semibold text-[#333] hover:text-[#8b7650] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#8b7650]" />
              Track Your Order
            </button>
          </div>

          <div className="pt-2 border-t border-[#dfd8cc]">
            <a
              href={`https://wa.me/${cleanHotline}?text=${encodeURIComponent('Assalam-o-Alaikum, I need assistance with A.ROYAL collections.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 px-4 py-2.5 rounded text-sm font-semibold w-full"
            >
              <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
              WhatsApp Concierge Service
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
