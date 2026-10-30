'use client';

import React from 'react';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { Heart, Eye, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ffffff'/%3E%3Ctext x='200' y='210' font-size='18' text-anchor='middle' fill='%238d8388' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

// Flat, image-first product card: big photo, badge, name, brand line, price (with struck-through old price)
export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { formatPrice, addToCart, toggleWishlist, isInWishlist } = useShop();

  const isFavorited = isInWishlist(product.id);
  const onSale = !!product.originalPrice && product.originalPrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;
  const needsChoice = product.sizes.length > 0 || product.colors.length > 0;

  const badge = soldOut ? 'Sold out' : onSale ? 'Sale' : product.isNew ? 'New' : product.bestSeller ? 'Best seller' : null;

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <div
        className="relative aspect-[4/5] w-full bg-white overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0] || PLACEHOLDER_IMG}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 ease-out ${product.images[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
          loading="lazy"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            className="absolute inset-0 w-full h-full object-contain p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 border ${
            isFavorited ? 'bg-[#6b1429] text-white border-[#6b1429]' : 'bg-white/90 text-[#4a4347] border-[#2a26291f] hover:text-[#6b1429]'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Hover actions */}
        <div className="absolute bottom-3 inset-x-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#2a2629] text-sm font-medium py-2.5 rounded-full border border-[#2a26291f] flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Quick view
          </button>
          {!soldOut && !needsChoice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="bg-[#6b1429] hover:bg-[#8a1c38] text-white w-11 rounded-full flex items-center justify-center"
              aria-label="Add to bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Badge */}
      <div className="h-12 flex items-end px-3 pb-2">
        {badge && (
          <span
            className={`text-xs tracking-wide px-3.5 py-1 rounded-full border ${
              badge === 'Sold out'
                ? 'border-[#2a262930] text-[#8d8388] bg-[#f3ebdd]'
                : badge === 'Sale'
                ? 'border-[#6b1429]/30 text-[#6b1429] bg-white'
                : 'border-[#2a26291f] text-[#2a2629] bg-white'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1 px-3 pb-2">
        <h3
          onClick={() => onQuickView(product)}
          className="text-[15px] tracking-wide text-[#2a2629] line-clamp-2 cursor-pointer hover:underline underline-offset-4"
        >
          {product.name}
        </h3>
        <p className="text-[11px] tracking-[0.16em] uppercase text-[#6f666a]">{product.categoryName}</p>
        <div className="pt-1 flex items-baseline gap-2.5 flex-wrap">
          {onSale && <span className="text-sm text-[#6f666a] line-through">{formatPrice(product.originalPrice!)}</span>}
          <span className="text-base text-[#2a2629]">{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}
