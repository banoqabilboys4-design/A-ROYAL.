import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatPKR } from '../utils/storage';

interface HeroProps {
  onExploreWatches: () => void;
  onExplorePerfumes: () => void;
  onSelectProduct: (productId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreWatches,
  onExplorePerfumes,
  onSelectProduct,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f2eb] via-[#faf9f6] to-[#faf9f6] pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-[#dfd8cc]/60">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c9ad79]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#8b7650]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8b7650]/10 border border-[#8b7650]/20 text-[#8b7650] text-xs font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              A New Standard of Luxury
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#151515] font-semibold tracking-tight leading-[1.15]">
              Curated Luxury That <br className="hidden sm:inline" />
              <span className="gold-gradient-text italic font-normal">Defines You.</span>
            </h1>

            <p className="text-[#555] text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Master-crafted chronographs forged in surgical-grade 316L steel, alongside pure extrait de parfums steeped in aged royal oud. Crafted for discerning collectors across Pakistan.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreWatches}
                className="w-full sm:w-auto px-8 py-4 bg-[#151515] hover:bg-[#8b7650] text-[#faf9f6] rounded text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Shop Timepieces</span>
                <ArrowRight className="w-4 h-4 text-[#c9ad79] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePerfumes}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-50 text-[#151515] border border-[#dfd8cc] hover:border-[#8b7650] rounded text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm"
              >
                Explore Scents
              </button>
            </div>

            {/* Quick credibility ticks */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-[#dfd8cc]/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-left">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#151515]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8b7650]" /> 100%
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mt-0.5">Authentic</span>
              </div>
              <div className="text-left">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#151515]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8b7650]" /> 316L
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mt-0.5">Steel & Oud</span>
              </div>
              <div className="text-left">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#151515]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8b7650]" /> COD
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mt-0.5">Nationwide</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Signature Showcase Cards */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-md flex items-center justify-center py-6">
              {/* Decorative Circle backdrop */}
              <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-[#c9ad79]/30 bg-gradient-to-tr from-[#8b7650]/5 to-transparent pointer-events-none" />

              {/* Floating Card 1: Royal Chronograph */}
              <div
                onClick={() => onSelectProduct('royal-chronograph')}
                className="w-44 sm:w-56 bg-white/95 backdrop-blur-md p-3.5 rounded-lg shadow-2xl border border-white/80 transform -rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer -mr-6 z-20 group hover:scale-105"
              >
                <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-3 relative">
                  <img
                    src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80"
                    alt="Royal Chronograph"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 right-2 bg-[#151515]/80 backdrop-blur-xs text-[#c9ad79] text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                    Featured
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b7650]">Master Watchmaker</p>
                <p className="font-serif text-sm sm:text-base font-semibold text-[#151515] truncate">Royal Chronograph</p>
                <p className="text-xs sm:text-sm font-bold text-[#8b7650] mt-0.5">{formatPKR(24999)}</p>
              </div>

              {/* Floating Card 2: Royal Oud */}
              <div
                onClick={() => onSelectProduct('royal-oud')}
                className="w-44 sm:w-56 bg-white/95 backdrop-blur-md p-3.5 rounded-lg shadow-2xl border border-white/80 transform rotate-4 hover:rotate-0 transition-all duration-500 cursor-pointer mt-12 sm:mt-16 z-30 group hover:scale-105"
              >
                <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-3 relative">
                  <img
                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"
                    alt="Royal Oud"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 right-2 bg-[#8b7650] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                    Bestseller
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b7650]">Haute Parfumerie</p>
                <p className="font-serif text-sm sm:text-base font-semibold text-[#151515] truncate">Royal Oud Extrait</p>
                <p className="text-xs sm:text-sm font-bold text-[#8b7650] mt-0.5">{formatPKR(7499)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
