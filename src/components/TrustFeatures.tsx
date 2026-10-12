import React from 'react';
import { Truck, ShieldCheck, Award, RefreshCw } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Free Insured Delivery',
      subtitle: 'Nationwide Express Shipping',
      desc: 'Carefully packaged and insured courier delivery directly to your door across all cities in Pakistan.',
    },
    {
      icon: ShieldCheck,
      title: 'Cash on Delivery',
      subtitle: 'Inspect Before You Pay',
      desc: 'Zero risk shopping. Complete payment with cash only upon safe handover by courier officer.',
    },
    {
      icon: Award,
      title: '100% Genuine Guarantee',
      subtitle: 'Master Craftsmanship',
      desc: 'Forged in 316L stainless steel and distilled with authentic royal fragrance oils.',
    },
    {
      icon: RefreshCw,
      title: '7-Day VIP Exchange',
      subtitle: 'Hassle-Free Return Policy',
      desc: 'Uncompromised peace of mind. Exchange with our dedicated concierge if you desire another model.',
    },
  ];

  return (
    <section className="bg-white py-12 border-b border-[#dfd8cc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 p-4 rounded-lg bg-[#faf9f6] border border-[#dfd8cc]/60 hover:border-[#c9ad79] transition-colors"
              >
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#151515] text-[#c9ad79] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-sm font-bold text-[#151515] leading-snug">{item.title}</h4>
                  <p className="text-[11px] font-semibold text-[#8b7650] uppercase tracking-wider mt-0.5">{item.subtitle}</p>
                  <p className="text-xs text-[#666] mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
