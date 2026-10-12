import React from 'react';
import { Eye, ShoppingBag, Zap, MessageCircle } from 'lucide-react';
import { Product } from '../data/initialData';
import { formatPKR, buildWhatsAppProductInquiryUrl } from '../utils/storage';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onBuyNow,
  whatsappNumber,
}) => {
  const isOutOfStock = product.stock <= 0;
  const discountPercent = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  // Extract a signature spec for quick display
  const keySpec = product.category === 'Watches'
    ? (product.specifications['Glass'] || product.specifications['Movement'] || 'Sapphire Glass')
    : (product.specifications['Concentration'] || product.specifications['Volume'] || 'Extrait de Parfum');

  const inquiryUrl = buildWhatsAppProductInquiryUrl(product, whatsappNumber);

  return (
    <div className="group bg-white rounded-lg border border-[#dfd8cc] overflow-hidden flex flex-col hover:border-[#c9ad79] hover:shadow-xl transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-[#151515] text-[#c9ad79] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
              Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#8b7650] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded">
              Sold Out
            </span>
          </div>
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 bg-white/95 backdrop-blur-md text-[#151515] hover:bg-[#151515] hover:text-[#c9ad79] text-[11px] font-bold uppercase tracking-wider rounded shadow-md transition-colors flex items-center justify-center gap-1.5"
            title="Quick View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#8b7650] uppercase tracking-wider font-semibold mb-1">
            <span>{product.category}</span>
            <span className="text-neutral-400 font-normal lowercase">{keySpec}</span>
          </div>

          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-base sm:text-lg font-bold text-[#151515] group-hover:text-[#8b7650] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#666] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-100 mt-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-base sm:text-lg font-extrabold text-[#151515] tracking-tight">
                {formatPKR(product.price)}
              </span>
              {product.old_price && (
                <span className="ml-2 text-xs text-neutral-400 line-through">
                  {formatPKR(product.old_price)}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              product.stock > 5 ? 'text-emerald-700' : product.stock > 0 ? 'text-amber-700' : 'text-rose-600'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product)}
                className="py-2.5 px-3 bg-[#faf9f6] hover:bg-neutral-100 text-[#151515] border border-[#dfd8cc] rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#8b7650]" />
                <span>Add to Bag</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => onBuyNow(product)}
                className="py-2.5 px-3 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-3.5 h-3.5 text-[#c9ad79]" />
                <span>Buy Now (COD)</span>
              </button>
            </div>

            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Order via WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
