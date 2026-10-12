import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, Truck, Package, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Order, StoreSettings } from '../data/initialData';
import { formatPKR, getStoredOrders } from '../utils/storage';
import { trackOrderApi } from '../utils/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  settings: StoreSettings;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sync if initialOrderId was passed
  React.useEffect(() => {
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim().toUpperCase();
    if (!q) return;

    setHasSearched(true);
    setIsSearching(true);

    try {
      // First try real backend database endpoint
      const order = await trackOrderApi(q);
      setSearchedOrder(order);
    } catch (err) {
      // Fallback to local storage lookup
      const allOrders = getStoredOrders();
      const cleanQ = q.replace(/[^0-9A-Z]/g, '');
      const found = allOrders.find((o) => {
        const matchId = o.id.toUpperCase() === q || o.id.replace(/[^0-9A-Z]/g, '') === cleanQ;
        const matchPhone = o.customer.phone.replace(/[^0-9]/g, '').includes(cleanQ);
        return matchId || matchPhone;
      });
      setSearchedOrder(found || null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus: Order['status']) => {
    const stages: Order['status'][] = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIdx = stages.indexOf(
      currentStatus === 'Processing' ? 'Confirmed' : currentStatus
    );
    if (currentIdx > stepIndex) return 'completed';
    if (currentIdx === stepIndex) return 'current';
    return 'upcoming';
  };

  const cleanHotline = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#dfd8cc] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#dfd8cc] bg-[#faf9f6] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#151515] uppercase tracking-wide">
              Track Your Royal Order
            </h2>
            <p className="text-xs text-[#8b7650] font-semibold tracking-wider">
              Real-time courier registry & dispatch status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-[#666] uppercase mb-1.5">
              Enter Order ID (e.g. ROYAL-7819) or Registered Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ROYAL-6332 or 03016145941"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none uppercase"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-6 py-2.5 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Track
              </button>
            </div>
          </div>

          {/* Result Section */}
          {searchedOrder ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Reference Header */}
              <div className="p-4 bg-[#faf9f6] border border-[#dfd8cc] rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Order Reference
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#151515]">
                    {searchedOrder.id}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Booked {new Date(searchedOrder.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Current Status
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-0.5 ${
                    searchedOrder.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : searchedOrder.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : searchedOrder.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {searchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-4">
                  Fulfillment Progress
                </h4>
                <div className="relative flex items-center justify-between">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 z-0" />

                  {/* 4 Steps */}
                  {[
                    { label: 'Order Placed', icon: Clock },
                    { label: 'Confirmed', icon: CheckCircle2 },
                    { label: 'Dispatched', icon: Truck },
                    { label: 'Delivered', icon: Package },
                  ].map((step, idx) => {
                    const status = getStepStatus(idx, searchedOrder.status);
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            status === 'completed'
                              ? 'bg-[#151515] border-[#151515] text-[#c9ad79]'
                              : status === 'current'
                              ? 'bg-[#8b7650] border-[#8b7650] text-white ring-4 ring-[#8b7650]/20'
                              : 'bg-white border-neutral-300 text-neutral-400'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-semibold tracking-wide mt-2 text-center ${
                          status !== 'upcoming' ? 'text-[#151515]' : 'text-neutral-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Destination Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Customer</span>
                  <strong className="text-[#151515] font-semibold">{searchedOrder.customer.name}</strong>
                  <span className="block text-neutral-500">{searchedOrder.customer.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Delivery Address</span>
                  <strong className="text-[#151515] font-semibold">
                    {searchedOrder.customer.address}, {searchedOrder.customer.city}
                  </strong>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-neutral-200 rounded p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#151515] block mb-2">
                  Items in Package ({searchedOrder.items.length})
                </span>
                {searchedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-neutral-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-8 h-10 object-cover rounded bg-neutral-100" />
                      <div>
                        <span className="font-semibold text-[#151515] block">{item.name}</span>
                        <span className="text-neutral-500 text-[11px]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-[#151515]">
                      {formatPKR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 text-xs font-bold text-[#151515]">
                  <span>Total Amount ({searchedOrder.paymentMethod})</span>
                  <span>{formatPKR(searchedOrder.total)}</span>
                </div>
              </div>

              {/* Inquire on WhatsApp */}
              <a
                href={`https://wa.me/${cleanHotline}?text=${encodeURIComponent(`Assalam-o-Alaikum Concierge, I am inquiring about tracking updates for Order ${searchedOrder.id} (${searchedOrder.customer.name}, ${searchedOrder.customer.city}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Contact Concierge on WhatsApp about this Order</span>
              </a>
            </div>
          ) : hasSearched ? (
            <div className="p-8 text-center space-y-3 bg-[#faf9f6] rounded border border-[#dfd8cc]">
              <AlertCircle className="w-8 h-8 text-[#8b7650] mx-auto" />
              <h4 className="font-serif text-base font-bold text-[#151515]">No Order Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We could not find an order matching <strong className="text-black font-semibold">"{searchQuery}"</strong>. Please verify your reference number or contact our WhatsApp concierge for live manual lookup.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded">
              Enter your Order ID (found on your invoice or confirmation text) to inspect live shipping dispatch status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
