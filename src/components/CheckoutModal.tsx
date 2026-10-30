'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Phone, 
  ArrowRight,
  Loader2,
  Terminal
} from 'lucide-react';
import { Order } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3ebdd'/%3E%3Ctext x='200' y='210' font-size='20' text-anchor='middle' fill='%238d8388' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

export function CheckoutModal({ isOpen, onClose, onOrderCompleted }: CheckoutModalProps) {
  const { 
    cart, 
    cartSubtotal, 
    formatPrice, 
    createOrder, 
    getWhatsAppOrderUrl 
  } = useShop();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'narok_delivery' | 'nationwide_parcel'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Narok Town');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_express' | 'whatsapp_order' | 'cash_on_pickup'>('mpesa_express');
  const [notes, setNotes] = useState('');

  // Processing & Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkStatus, setStkStatus] = useState<'idle' | 'prompt_sent' | 'pin_entered' | 'confirmed'>('idle');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Delivery charges are not preset; MACCY confirms any delivery cost with the customer after the order.
  const deliveryFee = 0;
  const totalAmount = cartSubtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    if (paymentMethod === 'mpesa_express') {
      setIsProcessing(true);
      setStkStatus('prompt_sent');

      setTimeout(() => {
        setStkStatus('pin_entered');
        setTimeout(() => {
          setStkStatus('confirmed');
          setIsProcessing(false);

          const mpesaCode = `Q${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

          const order = createOrder({
            customerName,
            phone,
            email,
            deliveryMethod,
            deliveryAddress: deliveryMethod === 'pickup' 
              ? 'Collection at Total Petrol Station boutique near Maasai Mara University junction' 
              : deliveryAddress,
            deliveryCity,
            paymentMethod,
            paymentStatus: 'paid',
            mpesaCode,
            items: cart.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              image: item.product.images[0] || PLACEHOLDER_IMG
            })),
            subtotal: cartSubtotal,
            deliveryFee,
            totalAmount,
            orderStatus: 'confirmed',
            notes
          });

          setCompletedOrder(order);
          onOrderCompleted(order);
        }, 1800);
      }, 2000);
    } else {
      const order = createOrder({
        customerName,
        phone,
        email,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'pickup' 
          ? 'Collection at Total Petrol Station boutique near Maasai Mara University junction' 
          : deliveryAddress,
        deliveryCity,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash_on_pickup' ? 'cash_on_delivery' : 'pending',
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          image: item.product.images[0] || PLACEHOLDER_IMG
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        totalAmount,
        orderStatus: 'pending',
        notes
      });

      setCompletedOrder(order);
      onOrderCompleted(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-2xl bg-[#fcf8f1] text-[#2a2629] rounded-lg shadow-2xl overflow-hidden border border-[#2a26291f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f3ebdd] px-6 py-4 flex items-center justify-between border-b border-[#2a262914]">
          <div>
            <h2 className="font-tight text-base sm:text-lg font-bold text-[#2a2629]">
              Checkout & Payment Protocol
            </h2>
            <p className="font-mono text-[11px] text-[#5f565a]">
              TOTAL PETROL STATION, NAROK • WHATSAPP: 0722 907 700
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#fcf8f1] hover:bg-[#eadfcc] text-[#5f565a] hover:text-[#2a2629] flex items-center justify-center transition-colors border border-[#2a26291f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-[#29c740]/20 border border-[#29c740]/40 rounded-md flex items-center justify-center mx-auto text-[#1f9d3a]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#2a2629] font-semibold">
                // ORDER DISPATCH CONFIRMED
              </span>
              <h3 className="font-tight text-2xl font-bold text-[#2a2629]">
                Asante Sana, {completedOrder.customerName}!
              </h3>
              <p className="font-tight text-xs text-[#5f565a]">Your order tracking reference code is:</p>
              <div className="inline-block bg-[#f3ebdd] text-[#a8791f] font-mono text-xl font-bold px-5 py-2 rounded-md border border-[#fead07]/40 my-1">
                {completedOrder.orderNumber}
              </div>
              {completedOrder.mpesaCode && (
                <p className="font-mono text-xs text-[#1f9d3a] font-semibold pt-1">
                  M-Pesa Reference: {completedOrder.mpesaCode}
                </p>
              )}
            </div>

            <div className="bg-[#f3ebdd] p-4 rounded-md text-left text-xs space-y-1.5 border border-[#2a262914] font-mono">
              <div className="flex justify-between text-[#5f565a]">
                <span>TOTAL AMOUNT:</span>
                <span className="font-bold text-[#2a2629]">{formatPrice(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[#5f565a]">
                <span>DELIVERY OPTION:</span>
                <span className="font-medium text-[#2a2629] capitalize">
                  {completedOrder.deliveryMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-[#5f565a]">
                <span>ADDRESS / STORE:</span>
                <span className="text-[#2a2629]">{completedOrder.deliveryAddress}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={getWhatsAppOrderUrl(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#29c740] hover:bg-[#24af38] text-black font-tight font-bold px-6 py-3 rounded-md text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp (0722 907 700)</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto shade-button-secondary px-6 py-3 text-xs"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold text-[#2a2629] uppercase tracking-wider">
                01 // CONTACT SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#5f565a] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Kerubo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-xs text-[#2a2629] focus:border-[#6b1429] outline-hidden font-tight"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#5f565a] mb-1">M-Pesa / WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-xs text-[#2a2629] focus:border-[#6b1429] outline-hidden font-tight"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="space-y-3 pt-3 border-t border-[#2a262914]">
              <h3 className="font-mono text-xs font-bold text-[#2a2629] uppercase tracking-wider">
                02 // DISPATCH OPTIONS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'pickup',
                    title: 'In-Store Pickup',
                    desc: 'Total Petrol Station, near Maasai Mara University junction',
                    fee: 'NO CHARGE'
                  },
                  {
                    id: 'narok_delivery',
                    title: 'Local Delivery',
                    desc: 'Delivery cost confirmed by MACCY',
                    fee: 'TBC'
                  },
                  {
                    id: 'nationwide_parcel',
                    title: 'Courier / Parcel',
                    desc: 'Delivery cost confirmed by MACCY',
                    fee: 'TBC'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.id as any)}
                    className={`p-3.5 rounded-md border text-left transition-all ${
                      deliveryMethod === opt.id
                        ? 'bg-[#f3ebdd] text-[#2a2629] border-[#6b1429] shadow-md'
                        : 'bg-[#f3ebdd] text-[#5f565a] border-[#2a262914] hover:border-[#2a262928] hover:text-[#2a2629]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-tight font-bold text-xs text-[#2a2629]">{opt.title}</span>
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                        deliveryMethod === opt.id ? 'bg-[#6b1429] text-white' : 'bg-[#fcf8f1] text-[#5f565a]'
                      }`}>
                        {opt.fee}
                      </span>
                    </div>
                    <p className="font-tight text-[11px] mt-1 text-[#5f565a]">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>

              {deliveryMethod !== 'pickup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-mono text-[10px] text-[#5f565a] mb-1">Destination Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, Nakuru, Narok"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-xs text-[#2a2629] focus:border-[#6b1429] outline-hidden font-tight"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#5f565a] mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near University Gate / CBD"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-xs text-[#2a2629] focus:border-[#6b1429] outline-hidden font-tight"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-3 border-t border-[#2a262914]">
              <h3 className="font-mono text-xs font-bold text-[#2a2629] uppercase tracking-wider">
                03 // SETTLEMENT PROTOCOL
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'mpesa_express',
                    title: 'Lipa na M-Pesa',
                    desc: 'Prompt sent to phone',
                    icon: Smartphone
                  },
                  {
                    id: 'whatsapp_order',
                    title: 'WhatsApp Concierge',
                    desc: 'Instant direct chat',
                    icon: Phone
                  },
                  {
                    id: 'cash_on_pickup',
                    title: 'Pay on Collection',
                    desc: 'At Total Petrol Station',
                    icon: CreditCard
                  }
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3.5 rounded-md border text-left transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-[#f3ebdd] text-[#2a2629] border-[#6b1429] shadow-md'
                          : 'bg-[#f3ebdd] text-[#5f565a] border-[#2a262914] hover:border-[#2a262928] hover:text-[#2a2629]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${paymentMethod === pm.id ? 'text-[#2a2629]' : 'text-[#8d8388]'}`} />
                      <p className="font-tight font-bold text-xs text-[#2a2629]">{pm.title}</p>
                      <p className="font-tight text-[11px] mt-0.5 text-[#5f565a]">
                        {pm.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STK Push Simulation Banner */}
            {isProcessing && (
              <div className="p-4 rounded-md bg-[#f3ebdd] border border-[#6b1429] text-[#2a2629] space-y-2 text-center animate-pulse">
                <Loader2 className="w-5 h-5 text-[#2a2629] animate-spin mx-auto" />
                <h4 className="font-tight font-bold text-sm text-[#2a2629]">
                  {stkStatus === 'prompt_sent' && 'Lipa na M-Pesa STK Prompt Dispatched!'}
                  {stkStatus === 'pin_entered' && 'Validating Safaricom PIN...'}
                  {stkStatus === 'confirmed' && 'Payment Verified & Confirmed!'}
                </h4>
                <p className="font-mono text-xs text-[#5f565a]">
                  Check phone ({phone}). Enter your 4-digit M-Pesa PIN for {formatPrice(totalAmount)} to MACCY COLLECTIONS.
                </p>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-[#f3ebdd] p-4 rounded-md border border-[#2a262914] space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[#5f565a]">
                <span>SUBTOTAL:</span>
                <span className="font-bold text-[#2a2629]">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5f565a]">
                <span>DELIVERY:</span>
                <span className="font-bold text-[#2a2629]">{deliveryMethod === 'pickup' ? 'NO CHARGE' : 'To be confirmed'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2a2629] pt-2 border-t border-[#2a262914]">
                <span>TOTAL PAYABLE:</span>
                <span className="text-base text-[#2a2629]">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full shade-button-primary disabled:opacity-50 py-3 rounded-md text-xs sm:text-sm font-tight font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#2a2629]" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Place Order • {formatPrice(totalAmount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
