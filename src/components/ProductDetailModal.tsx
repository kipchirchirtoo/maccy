'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { X, Heart, Minus, Plus, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct?: (p: Product) => void;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ffffff'/%3E%3Ctext x='200' y='210' font-size='18' text-anchor='middle' fill='%238d8388' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

// Product page (shown as a large overlay). The parent remounts it per product via `key`.
export function ProductDetailModal({ product, onClose, onSelectProduct }: ProductDetailModalProps) {
  const { formatPrice, addToCart, toggleWishlist, isInWishlist, getWhatsAppProductUrl, products } = useShop();

  const [imageIdx, setImageIdx] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [needChoice, setNeedChoice] = useState(false);

  if (!product) return null;

  const images = product.images.length ? product.images : [PLACEHOLDER_IMG];
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const onSale = !!product.originalPrice && product.originalPrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;
  const fav = isInWishlist(product.id);

  const add = () => {
    if ((product.sizes.length && !size) || (product.colors.length && !color)) {
      setNeedChoice(true);
      return;
    }
    addToCart(product, size || 'Standard', color || 'Default', qty);
    onClose();
  };

  const pill = (active: boolean) =>
    `px-5 py-2 rounded-full text-sm border transition ${active ? 'bg-[#2a2629] text-white border-[#2a2629]' : 'bg-white text-[#2a2629] border-[#2a262940] hover:border-[#2a2629]'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto" onClick={onClose}>
      <div
        className="relative bg-white text-[#2a2629] w-full max-w-6xl mx-auto my-0 sm:my-8 sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white border border-[#2a26291f] hover:bg-[#f3ebdd] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-8">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-3">
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-2 overflow-auto lg:max-h-[560px]">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white border-2 ${i === imageIdx ? 'border-[#2a2629]' : 'border-[#2a262912]'}`}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 aspect-square lg:aspect-[4/5] bg-white border border-[#2a262912] rounded-xl overflow-hidden">
              <img src={images[imageIdx] || images[0]} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-4" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImageIdx((imageIdx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#2a26291f] flex items-center justify-center" aria-label="Previous image"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setImageIdx((imageIdx + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#2a26291f] flex items-center justify-center" aria-label="Next image"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6 md:pt-4">
            <div className="space-y-2">
              <p className="text-xs tracking-[0.16em] uppercase text-[#6f666a]">{product.categoryName}</p>
              <h2 className="!font-sans !font-semibold !text-[#2a2629] text-3xl sm:text-4xl leading-tight !tracking-tight">{product.name}</h2>
              <div className="flex items-center gap-3 flex-wrap pt-1">
                {onSale && <span className="text-lg text-[#6f666a] line-through">{formatPrice(product.originalPrice!)}</span>}
                <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
                {onSale && <span className="text-xs border border-[#6b1429]/30 text-[#6b1429] rounded-full px-3 py-1">Sale</span>}
                {soldOut && <span className="text-xs border border-[#2a262930] text-[#6f666a] rounded-full px-3 py-1">Sold out</span>}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm">Colour: <span className="text-[#5f565a]">{color || 'Select'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => { setColor(c); setNeedChoice(false); }} className={pill(color === c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm">Size: <span className="text-[#5f565a]">{size || 'Select'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => { setSize(s); setNeedChoice(false); }} className={pill(size === s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {needChoice && (
              <p role="alert" className="text-sm text-[#b3261e]">
                Please choose {product.sizes.length && !size ? 'a size' : ''}
                {product.sizes.length && !size && product.colors.length && !color ? ' and ' : ''}
                {product.colors.length && !color ? 'a colour' : ''}.
              </p>
            )}

            <div className="space-y-2">
              <p className="text-sm">Quantity</p>
              <div className="inline-flex items-center border border-[#2a262940] rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center" aria-label="Decrease"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-11 flex items-center justify-center" aria-label="Increase"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={add}
                disabled={soldOut}
                className="w-full py-3.5 rounded-full border border-[#2a2629] text-[#2a2629] hover:bg-[#2a2629] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#2a2629] transition-colors text-[15px]"
              >
                {soldOut ? 'Sold out' : 'Add to bag'}
              </button>
              <a
                href={getWhatsAppProductUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-[#6b1429] hover:bg-[#8a1c38] text-white text-[15px] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> Order on WhatsApp
              </a>
              <button onClick={() => toggleWishlist(product.id)} className="w-full text-sm flex items-center justify-center gap-2 py-2 hover:text-[#6b1429]">
                <Heart className={`w-4 h-4 ${fav ? 'fill-current text-[#6b1429]' : ''}`} /> {fav ? 'Saved to wishlist' : 'Add to wishlist'}
              </button>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-[#2a262914] text-[15px] leading-relaxed text-[#4a4347] whitespace-pre-line">{product.description}</div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && onSelectProduct && (
          <div className="border-t border-[#2a262914] p-4 sm:p-8 space-y-5">
            <h3 className="text-2xl font-semibold">You may also like</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
              {related.map((r) => (
                <button key={r.id} onClick={() => onSelectProduct(r)} className="text-left group space-y-2">
                  <div className="aspect-square bg-white border border-[#2a262912] rounded-xl overflow-hidden">
                    <img src={r.images[0] || PLACEHOLDER_IMG} alt={r.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-sm line-clamp-1 px-1">{r.name}</p>
                  <p className="text-sm px-1 font-medium">{formatPrice(r.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
