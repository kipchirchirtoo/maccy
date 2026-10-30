'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { X, Search, Package, Clock, Phone, Terminal } from 'lucide-react';
import { Order, TailoringRequest } from '@/types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackingModal({ isOpen, onClose }: OrderTrackingModalProps) {
  const { findOrder, formatPrice, sendWhatsAppMessage, tailoringRequests } = useShop();
  const [searchedTailoring, setSearchedTailoring] = useState<TailoringRequest | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const code = searchCode.trim().toUpperCase();
    const found = findOrder(code);
    setSearchedOrder(found || null);
    setSearchedTailoring(tailoringRequests.find(t => t.requestNumber.toUpperCase() === code) || null);
    setHasSearched(true);
  };

  const getStepProgress = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'in_preparation': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = searchedOrder ? getStepProgress(searchedOrder.orderStatus) : 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-xl bg-[#fcf8f1] text-[#2a2629] rounded-lg shadow-2xl overflow-hidden border border-[#2a26291f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f3ebdd] px-6 py-4 flex items-center justify-between border-b border-[#2a262914]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2a2629]" />
            <h2 className="font-tight text-sm sm:text-base font-bold text-[#2a2629]">
              Track an order or tailoring request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#fcf8f1] hover:bg-[#eadfcc] text-[#5f565a] hover:text-[#2a2629] flex items-center justify-center transition-colors border border-[#2a26291f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter your reference code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md pl-9 pr-4 py-2 text-xs sm:text-sm font-mono uppercase text-[#2a2629] focus:border-[#6b1429] outline-hidden"
              />
              <Search className="w-4 h-4 text-[#8d8388] absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="shade-button-primary px-5 py-2 rounded-md text-xs font-tight font-semibold"
            >
              Lookup
            </button>
          </form>

          {searchedTailoring && (
            <div className="space-y-2 bg-[#f3ebdd] p-5 rounded-md border border-[#2a262914] text-sm">
              <p className="font-mono text-base font-bold">{searchedTailoring.requestNumber}</p>
              <p className="text-[#5f565a]">{searchedTailoring.garmentType || 'Custom tailoring request'}</p>
              <p>Status: <strong className="text-[#6b1429]">{searchedTailoring.status.replace(/_/g, ' ')}</strong></p>
              <p className="text-xs text-[#8d8388]">Submitted {new Date(searchedTailoring.createdAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Search Result */}
          {searchedTailoring ? null : searchedOrder ? (
            <div className="space-y-5 bg-[#f3ebdd] p-5 sm:p-6 rounded-md border border-[#2a262914]">
              <div className="flex items-center justify-between border-b border-[#2a262914] pb-3">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#2a2629] font-semibold">
                    // REFERENCE CODE
                  </span>
                  <p className="font-mono text-base font-bold text-[#2a2629]">{searchedOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8d8388]">Date Placed</span>
                  <p className="font-mono text-xs text-[#5f565a]">
                    {new Date(searchedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#8d8388]">
                  <span className={currentStep >= 1 ? 'text-[#2a2629] font-bold' : ''}>[ 01 PLACED ]</span>
                  <span className={currentStep >= 2 ? 'text-[#2a2629] font-bold' : ''}>[ 02 CONFIRMED ]</span>
                  <span className={currentStep >= 3 ? 'text-[#a8791f] font-bold' : ''}>[ 03 DISPATCHED ]</span>
                  <span className={currentStep >= 4 ? 'text-[#1f9d3a] font-bold' : ''}>[ 04 DELIVERED ]</span>
                </div>

                <div className="w-full bg-[#fcf8f1] h-2 rounded-full overflow-hidden border border-[#2a26291f]">
                  <div 
                    className="bg-[#6b1429] h-full transition-all duration-500 shadow-md"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>

                <div className="p-3 bg-[#fcf8f1] rounded-md text-xs space-y-1 border border-[#2a262914]">
                  <p className="font-mono text-[11px] text-[#2a2629] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2a2629]" />
                    STATUS: <span className="uppercase text-[#2a2629] font-bold">{searchedOrder.orderStatus}</span>
                  </p>
                  <p className="font-tight text-[#5f565a] text-xs">
                    {searchedOrder.deliveryMethod === 'pickup'
                      ? 'Collection at Total Petrol Station boutique near Maasai Mara University junction.'
                      : `En route to ${searchedOrder.deliveryAddress}, ${searchedOrder.deliveryCity}.`}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 pt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d8388]">
                  ITEMS IN CONSIGNMENT:
                </span>
                <div className="space-y-1 text-xs">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#4a4347] font-mono">
                      <span>{item.productName} ({item.selectedSize}) x{item.quantity}</span>
                      <span className="font-bold text-[#2a2629]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Support CTA */}
              <button
                onClick={() => sendWhatsAppMessage(`Hello MACCY COLLECTIONS! Checking on order #${searchedOrder.orderNumber} for ${searchedOrder.customerName}. Any updates on dispatch?`)}
                className="w-full bg-[#29c740]/15 hover:bg-[#29c740] border border-[#29c740]/40 text-[#1f9d3a] hover:text-black py-2.5 px-4 rounded-md text-xs font-tight font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Inquire Status on WhatsApp (0722 907 700)</span>
              </button>
            </div>
          ) : hasSearched ? (
            <div className="p-6 text-center space-y-2 bg-[#f3ebdd] rounded-md border border-[#2a262914]">
              <p className="font-tight text-sm font-bold text-[#2a2629]">No Order Found with Code &quot;{searchCode}&quot;</p>
              <p className="font-tight text-xs text-[#5f565a]">
                Please double-check your order number or ask us on WhatsApp.
              </p>
              <button
                onClick={() => sendWhatsAppMessage(`Hello MACCY COLLECTIONS, I need help checking my order status. My code is ${searchCode}`)}
                className="mt-1 text-xs font-mono text-[#1f9d3a] hover:underline"
              >
                Inquire on WhatsApp &rarr;
              </button>
            </div>
                        ) : null}
        </div>
      </div>
    </div>
  );
}
