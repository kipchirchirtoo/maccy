'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { Phone, MapPin, MessageCircle, ArrowUp, Mail } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (section: string) => void;
  onOpenTrackOrder: () => void;
}

export function Footer({ onNavigateSection, onOpenTrackOrder }: FooterProps) {
  const { categories, setSelectedCategory } = useShop();

  return (
    <footer className="bg-[#f3ebdd] text-[#5f565a] border-t border-[#2a262914] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MACCY COLLECTIONS logo" className="w-28 h-28 object-contain" />
            <p className="text-sm leading-relaxed max-w-sm">
              A woman-owned Kenyan fashion and lifestyle business.
            </p>
            <div className="space-y-2 text-sm text-[#4a4347]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#6b1429] shrink-0" />
                Total Petrol Station, near Maasai Mara University junction
              </p>
              <a href="https://wa.me/254722907700" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Phone className="w-4 h-4 text-[#6b1429] shrink-0" />
                WhatsApp: 0722 907 700
              </a>
              <a href="mailto:gladyskirorei6@gmail.com" className="flex items-center gap-2 hover:underline">
                <Mail className="w-4 h-4 text-[#6b1429] shrink-0" />
                gladyskirorei6@gmail.com
              </a>
            </div>
          </div>

          {/* Categories (driven by the admin dashboard) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-semibold text-[#6b1429]">Shop by category</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      onNavigateSection('catalog');
                    }}
                    className="hover:text-[#6b1429] transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold text-[#6b1429]">Customer care</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onOpenTrackOrder} className="hover:text-[#6b1429] transition-colors">Track an order or tailoring request</button></li>
              <li><button onClick={() => onNavigateSection('story')} className="hover:text-[#6b1429] transition-colors">About us</button></li>
              <li><button onClick={() => onNavigateSection('contact')} className="hover:text-[#6b1429] transition-colors">Contact us</button></li>
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-xs text-[#4a4347] bg-white hover:bg-[#fcf8f1] px-3 py-1.5 rounded-full border border-[#2a26291f] transition-all"
            >
              <ArrowUp className="w-3 h-3" /> Back to top
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2a262914] text-xs text-[#8d8388]">
          © 2026 MACCY COLLECTIONS. All rights reserved.
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/254722907700"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-white hover:bg-[#fcf8f1] text-[#2a2629] border border-[#2a26291f] px-4 py-3 rounded-full shadow-md flex items-center gap-2.5 transition-all"
        aria-label="Chat on WhatsApp"
        title="WhatsApp: 0722 907 700"
      >
        <MessageCircle className="w-4 h-4 text-[#1f9d3a]" />
        <span className="text-sm font-medium">0722 907 700</span>
      </a>
    </footer>
  );
}
