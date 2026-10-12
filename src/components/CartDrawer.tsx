import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { OrderItem } from '../data/initialData';
import { formatPKR } from '../utils/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  whatsappNumber: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  whatsappNumber,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // WhatsApp instant order message
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const itemsText = items
    .map(i => `• ${i.name} (Qty: ${i.quantity}) - ${formatPKR(i.price * i.quantity)}`)
    .join('\n');
  const cartWhatsAppText = `Assalam-o-Alaikum A.ROYAL Concierge, I would like to order the following items from my bag:\n\n${itemsText}\n\n*Total Amount:* ${formatPKR(subtotal)}\n*Delivery Method:* Free Insured Cash on Delivery (COD)\n\nPlease take my delivery address.`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(cartWhatsAppText)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#dfd8cc]">
          {/* Header */}
          <div className="p-5 border-b border-[#dfd8cc] bg-[#faf9f6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8b7650]" />
              <h2 className="font-serif text-lg font-bold text-[#151515] tracking-wide">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="bg-[#151515] text-[#dfd8cc] p-3 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <Truck className="w-4 h-4 text-[#c9ad79]" />
              Complimentary Insured Delivery Across Pakistan
            </span>
            <span className="bg-[#c9ad79] text-[#151515] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
              FREE
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#faf9f6] border border-[#dfd8cc] flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8 text-[#8b7650]/50" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#151515]">Your Bag is Empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Discover our curated chronographs and master-crafted perfumes to elevate your royal presence.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border border-[#dfd8cc]/80 bg-[#faf9f6] hover:border-[#c9ad79] transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-22 object-cover rounded bg-neutral-100 shrink-0 border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b7650]">
                            {item.category}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-[#151515] leading-snug">
                            {item.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[#151515] mt-1">
                        {formatPKR(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60">
                      <div className="flex items-center border border-[#dfd8cc] rounded bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#151515]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#8b7650]">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout CTAs */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#dfd8cc] bg-[#faf9f6] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#151515]">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8b7650]" />
                    Insured Nationwide Shipping
                  </span>
                  <span className="font-semibold text-emerald-700 uppercase">Free</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-bold text-[#151515]">
                  <span>Total</span>
                  <span className="text-lg text-[#151515]">{formatPKR(subtotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#8b7650] font-semibold bg-[#8b7650]/10 p-2 rounded justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cash on Delivery (COD) Available Nationwide</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full py-3.5 px-4 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-2 shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#c9ad79] group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Instantly on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
