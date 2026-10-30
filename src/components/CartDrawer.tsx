'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Phone } from 'lucide-react';

interface CartDrawerProps {
  onProceedCheckout: () => void;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3ebdd'/%3E%3Ctext x='200' y='210' font-size='20' text-anchor='middle' fill='%238d8388' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

export function CartDrawer({ onProceedCheckout }: CartDrawerProps) {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    cartSubtotal, 
    totalCartItems, 
    formatPrice,
    sendWhatsAppMessage
  } = useShop();

  if (!isCartOpen) return null;

  const handleQuickWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsText = cart.map(item => `• ${item.product.name} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`).join('\n');
    const msg = `*NEW INQUIRY / ORDER via MACCY COLLECTIONS*\n\nItems in my bag:\n${itemsText}\n\n*Subtotal:* ${formatPrice(cartSubtotal)}\n\nPlease advise on availability and delivery from Total Petrol Station boutique!`;
    sendWhatsAppMessage(msg);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fcf8f1] text-[#2a2629] shadow-2xl flex flex-col border-l border-[#2a262914]">
          {/* Header */}
          <div className="px-5 py-4 bg-[#f3ebdd] flex items-center justify-between border-b border-[#2a262914]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2a2629]" />
              <h2 className="font-tight text-sm font-bold text-[#2a2629]">
                Shopping Bag ({totalCartItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-md text-[#5f565a] hover:text-[#2a2629] hover:bg-[#2a26290d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-12 h-12 rounded-md bg-[#f3ebdd] border border-[#2a26291f] flex items-center justify-center text-[#8d8388]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-tight text-base font-bold text-[#2a2629]">Your Bag is Empty</h3>
                <p className="font-tight text-xs text-[#5f565a] max-w-xs">
                  Discover authentic Kenyan tailoring, footwear, gifts, and lifestyle pieces.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 shade-button-primary text-xs px-5 py-2 font-tight font-semibold"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs font-mono text-[#8d8388] pb-2 border-b border-[#2a26290f]">
                  <span>SELECTED ITEMS // NAROK ATELIER</span>
                  <button
                    onClick={clearCart}
                    className="text-[#f9452d] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>

                {cart.map((item, idx) => (
                  <div 
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-3 bg-[#f3ebdd] p-3 rounded-md border border-[#2a262914]"
                  >
                    <img 
                      src={item.product.images[0] || PLACEHOLDER_IMG} 
                      alt={item.product.name}
                      className="w-18 h-22 object-cover rounded-sm bg-[#fcf8f1] border border-[#2a26290f] shrink-0" 
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-tight text-xs font-bold text-[#2a2629] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="font-mono text-[10px] text-[#5f565a]">
                          SIZE: {item.selectedSize} // COLOR: {item.selectedColor}
                        </p>
                        <p className="font-mono text-xs font-bold text-[#2a2629] pt-0.5">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Controls (Shade Style) */}
                        <div className="flex items-center border border-[#2a26291f] rounded-md bg-[#fcf8f1] overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="px-2 py-0.5 text-[#5f565a] hover:text-[#2a2629] hover:bg-[#2a26290d]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono text-xs font-bold text-[#2a2629]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="px-2 py-0.5 text-[#5f565a] hover:text-[#2a2629] hover:bg-[#2a26290d]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-[#8d8388] hover:text-[#f9452d] p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#f3ebdd] border-t border-[#2a262914] space-y-3">
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-[#5f565a]">
                  <span>SUBTOTAL:</span>
                  <span className="font-bold text-[#2a2629] text-sm">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5f565a]">
                  <span>NAROK BOUTIQUE PICKUP:</span>
                  <span className="text-[#1f9d3a] font-bold">FREE</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedCheckout();
                  }}
                  className="w-full shade-button-primary font-tight font-semibold py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#2a2629]/70" />
                </button>

                <button
                  onClick={handleQuickWhatsAppCheckout}
                  className="w-full bg-[#29c740]/15 hover:bg-[#29c740] border border-[#29c740]/40 text-[#1f9d3a] hover:text-black font-tight font-bold py-2.5 px-4 rounded-md text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Order via WhatsApp (0722 907 700)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
