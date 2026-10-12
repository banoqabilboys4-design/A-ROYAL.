import React from 'react';
import { Crown, MessageCircle, Mail, Phone, ShieldCheck, Lock, Truck, RefreshCw } from 'lucide-react';
import { StoreSettings } from '../data/initialData';

interface FooterProps {
  settings: StoreSettings;
  onSelectCategory: (cat: string) => void;
  onOpenTrack: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenTrack,
  onOpenAdmin,
}) => {
  const cleanHotline = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#151515] text-[#dfd8cc] border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#8b7650] text-[#151515] flex items-center justify-center font-bold">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white block uppercase leading-none">
                  {settings.storeName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#c9ad79] font-semibold block mt-1">
                  {settings.tagline}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              An atelier dedicated to precision horology and rare fragrance artistry. Hand-assembled chronographs forged in surgical steel and pure extrait de parfum steeped in precious woods.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${cleanHotline}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-neutral-900 border border-neutral-800 hover:border-[#8b7650] text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp VIP Concierge</span>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c9ad79]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors"
                >
                  Precision Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Perfumes')}
                  className="hover:text-white transition-colors"
                >
                  Signature Perfumes & Oud
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-white transition-colors"
                >
                  Featured Timepieces
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Watches')}
                  className="hover:text-white transition-colors"
                >
                  Automatic & Chrono Series
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c9ad79]">
              Concierge & Orders
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={onOpenTrack}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Nationwide Insured Delivery (COD)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                <span>7-Day Exchange Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hotline & Management */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c9ad79]">
              Contact Concierge
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8b7650]" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8b7650]" />
                <span>concierge@aroyal.pk</span>
              </p>
              <div className="pt-3">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white py-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 transition-colors"
                >
                  <Lock className="w-3 h-3 text-[#c9ad79]" />
                  <span>Admin Security Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© 2026 {settings.storeName}. All rights reserved.</p>
          <p className="font-serif italic text-neutral-400">
            "Luxury That Defines You. Wear the moment."
          </p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-neutral-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
