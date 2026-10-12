import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Printer, MessageCircle, Truck, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { Order, OrderItem, CustomerDetails, StoreSettings } from '../data/initialData';
import { formatPKR, buildWhatsAppOrderUrl } from '../utils/storage';
import { submitRealOrder } from '../utils/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onOrderSuccess: (order: Order) => void;
  settings: StoreSettings;
  onOpenTrackWithId?: (orderId: string) => void;
}

const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala',
  'Quetta',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Other City',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  settings,
  onOpenTrackWithId,
}) => {
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: 'Karachi',
    address: '',
    notes: '',
  });

  const [customCity, setCustomCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery (COD)' | 'Direct Bank Transfer'>('Cash on Delivery (COD)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0; // Free delivery
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const effectiveCity = formData.city === 'Other City' ? customCity || 'Pakistan' : formData.city;

    try {
      // Real backend order submission with server-side price validation
      const payloadItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const res = await submitRealOrder(
        {
          ...formData,
          city: effectiveCity,
          whatsapp: formData.whatsapp || formData.phone,
        },
        payloadItems,
        paymentMethod
      );

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        onOrderSuccess(res.order);
      } else {
        throw new Error(res.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Order processing failed:', err);
      setErrorMessage(err.message || 'Could not process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
              {completedOrder ? 'Order Confirmed' : 'Checkout & Express Delivery'}
            </h2>
            <p className="text-xs text-[#8b7650] font-semibold tracking-wider">
              {completedOrder ? 'Thank you for choosing A.ROYAL' : 'Insured Nationwide Dispatch across Pakistan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center" id="printable-receipt">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7650]">
                  Your Order Reference ID
                </span>
                <h3 className="font-serif text-3xl font-extrabold text-[#151515] mt-1 tracking-wider">
                  {completedOrder.id}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Placed on {new Date(completedOrder.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-[#faf9f6] border border-[#dfd8cc] rounded-lg p-5 text-left space-y-4">
                <div className="border-b border-neutral-200 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-2">
                    Delivery Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Recipient:</span>
                      <p className="font-semibold text-[#151515]">{completedOrder.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Phone:</span>
                      <p className="font-semibold text-[#151515]">{completedOrder.customer.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-500">Address:</span>
                      <p className="font-semibold text-[#151515]">
                        {completedOrder.customer.address}, {completedOrder.customer.city}
                      </p>
                    </div>
                    {completedOrder.customer.notes && (
                      <div className="col-span-2">
                        <span className="text-neutral-500">Notes:</span>
                        <p className="italic text-[#555]">{completedOrder.customer.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="border-b border-neutral-200 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-2">
                    Items In Package
                  </h4>
                  <div className="space-y-2">
                    {completedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-10 object-cover rounded bg-neutral-100"
                          />
                          <div>
                            <span className="font-semibold text-[#151515] block">{item.name}</span>
                            <span className="text-[11px] text-neutral-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-[#151515]">
                          {formatPKR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-[#151515]">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-700 uppercase">Free Insured Dispatch</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#151515] pt-2 border-t border-neutral-200">
                    <span>Total Payable:</span>
                    <span>{formatPKR(completedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Completed Order */}
              <div className="space-y-2 pt-2">
                <a
                  href={buildWhatsAppOrderUrl(completedOrder, settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirm Order via WhatsApp Concierge</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePrint}
                    className="py-2.5 px-3 bg-white hover:bg-neutral-50 text-[#151515] border border-[#dfd8cc] rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-[#8b7650]" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenTrackWithId) {
                        onClose();
                        onOpenTrackWithId(completedOrder.id);
                      }
                    }}
                    className="py-2.5 px-3 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 text-[#c9ad79]" />
                    <span>Track Order</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full text-xs text-neutral-500 hover:text-black py-2 underline"
                >
                  Continue Browsing Collections
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Customer & Shipping Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#151515] border-b border-neutral-100 pb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#151515] text-[#c9ad79] flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Shipping & Customer Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wahab Nadeem"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Phone Number * (03xx-xxxxxxx)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0301 6145941"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Same as phone number"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                    >
                      {PAKISTANI_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.city === 'Other City' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                        Specify City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sialkot / Larkana"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Complete Shipping Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Apartment #, Street #, Sector / Area landmark..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please call before delivery, gift packaging"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2.5 bg-[#faf9f6] border border-[#dfd8cc] focus:border-[#8b7650] rounded text-xs text-[#151515] focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#151515] border-b border-neutral-100 pb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#151515] text-[#c9ad79] flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Payment Method</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'Cash on Delivery (COD)'
                        ? 'border-[#8b7650] bg-[#faf9f6] ring-1 ring-[#8b7650]'
                        : 'border-[#dfd8cc] hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery (COD)"
                      checked={paymentMethod === 'Cash on Delivery (COD)'}
                      onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                      className="mt-1 text-[#8b7650] focus:ring-[#8b7650]"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#151515] block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Pay cash upon parcel delivery.
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'Direct Bank Transfer'
                        ? 'border-[#8b7650] bg-[#faf9f6] ring-1 ring-[#8b7650]'
                        : 'border-[#dfd8cc] hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Direct Bank Transfer"
                      checked={paymentMethod === 'Direct Bank Transfer'}
                      onChange={() => setPaymentMethod('Direct Bank Transfer')}
                      className="mt-1 text-[#8b7650] focus:ring-[#8b7650]"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#151515] block">
                        Direct Bank Transfer / Raast
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Transfer via Online Banking / Raast ID.
                      </span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'Direct Bank Transfer' && (
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#151515] mb-1">
                      <Building className="w-4 h-4 text-[#8b7650]" />
                      <span>{settings.storeName} Bank Account Details:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-neutral-600">
                      <div>Bank: <strong className="text-[#151515]">{settings.bankDetails.bankName}</strong></div>
                      <div>Title: <strong className="text-[#151515]">{settings.bankDetails.accountTitle}</strong></div>
                      <div>Account #: <strong className="text-[#151515]">{settings.bankDetails.accountNumber}</strong></div>
                      <div>IBAN: <strong className="text-[#151515]">{settings.bankDetails.iban}</strong></div>
                    </div>
                    <p className="text-[11px] text-neutral-500 italic pt-1">
                      Please send receipt screenshot on WhatsApp after completing the transfer.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Total Overview */}
              <div className="p-4 bg-[#faf9f6] border border-[#dfd8cc] rounded-lg space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-[#151515]">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8b7650]" />
                    Insured Express Delivery
                  </span>
                  <span className="font-semibold text-emerald-700 uppercase">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#151515] pt-2 border-t border-neutral-200">
                  <span>Grand Total</span>
                  <span className="text-base text-[#151515]">{formatPKR(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#151515] hover:bg-[#8b7650] text-white rounded text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Placing Order in Registry...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#c9ad79]" />
                    <span>Confirm & Place Order ({formatPKR(total)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
