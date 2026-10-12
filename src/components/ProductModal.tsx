import React, { useState } from 'react';
import { X, ShoppingBag, Zap, MessageCircle, ShieldCheck, Truck, RefreshCw, Plus, Minus } from 'lucide-react';
import { Product } from '../data/initialData';
import { formatPKR, buildWhatsAppProductInquiryUrl } from '../utils/storage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  whatsappNumber: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  whatsappNumber,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discountPercent = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const inquiryUrl = buildWhatsAppProductInquiryUrl(product, whatsappNumber);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#dfd8cc] max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-black border border-neutral-200 shadow-sm transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Gallery / Image */}
        <div className="md:w-1/2 bg-[#faf9f6] p-6 sm:p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-[#dfd8cc]">
          <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-neutral-200 shadow-inner relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {product.featured && (
              <span className="absolute top-3 left-3 bg-[#151515] text-[#c9ad79] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                A.ROYAL Signature
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Product Details & Specifications */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8b7650]">
                {product.category}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-semibold text-emerald-700">
                {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515] leading-tight">
              {product.name}
            </h2>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-[#151515]">
                {formatPKR(product.price)}
              </span>
              {product.old_price && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPKR(product.old_price)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#8b7650] bg-[#8b7650]/10 px-2 py-0.5 rounded">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-[#555] leading-relaxed">
              {product.description}
            </p>

            {/* Specifications Key-Value Table */}
            <div className="mt-6 border-t border-neutral-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
                Master Specifications & Profile
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-[#faf9f6]">
                    <span className="text-neutral-500 font-medium">{key}</span>
                    <span className="text-[#151515] font-semibold text-right max-w-[65%]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Guarantees */}
            <div className="mt-6 p-3 bg-[#faf9f6] rounded border border-[#dfd8cc]/80 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#333]">
                <Truck className="w-4 h-4 text-[#8b7650] shrink-0" />
                <span>Complimentary Insured Courier Delivery Across Pakistan</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#333]">
                <ShieldCheck className="w-4 h-4 text-[#8b7650] shrink-0" />
                <span>Cash on Delivery — Inspect package upon arrival</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#333]">
                <RefreshCw className="w-4 h-4 text-[#8b7650] shrink-0" />
                <span>7-Day VIP Exchange with Dedicated Concierge</span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-3 pt-4 border-t border-[#dfd8cc]">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Quantity:
              </span>
              <div className="flex items-center border border-[#dfd8cc] rounded bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-[#151515]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-50"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="py-3 px-4 bg-[#faf9f6] hover:bg-neutral-100 text-[#151515] border border-[#dfd8cc] rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4 text-[#8b7650]" />
                <span>Add to Bag</span>
              </button>

              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  onBuyNow(product, quantity);
                  onClose();
                }}
                className="py-3 px-4 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-[#c9ad79]" />
                <span>Buy Now (COD)</span>
              </button>
            </div>

            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order via WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
