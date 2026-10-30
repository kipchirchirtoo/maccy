'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Search, ShoppingBag, Menu, X, Package, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenTrackOrder: () => void;
  onNavigateSection: (sectionId: string) => void;
}

type NavItem = { label: string; section: string; cat?: string };

export function Navbar({ onOpenTrackOrder, onNavigateSection }: NavbarProps) {
  const {
    totalCartItems,
    setIsCartOpen,
    currency,
    toggleCurrency,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const hasTailoringCategory = categories.some((c) => c.id === 'custom_tailoring');

  // Every category (managed in the admin dashboard) appears in the menu
  const navItems: NavItem[] = [
    { label: 'Home', section: 'top' },
    { label: 'All Products', section: 'catalog', cat: 'all' },
    ...categories.map((c) =>
      c.id === 'custom_tailoring'
        ? { label: c.name, section: 'tailoring' }
        : { label: c.name, section: 'catalog', cat: c.id }
    ),
    ...(hasTailoringCategory ? [] : [{ label: 'Custom Tailoring', section: 'tailoring' }]),
    { label: 'About', section: 'story' },
    { label: 'Contact', section: 'contact' },
  ];

  const go = (item: NavItem) => {
    if (item.section === 'top') {
      setSelectedCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (item.cat) {
        setSelectedCategory(item.cat);
        setSearchQuery('');
      }
      onNavigateSection(item.section);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (item: NavItem) => !!item.cat && selectedCategory === item.cat && !searchQuery;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCategory('all');
    setSearchQuery(draft.trim());
    onNavigateSection('catalog');
    setIsSearchOpen(false);
  };

  const iconBtn = 'w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 hover:text-white transition-colors';

  return (
    <header className="bg-[#1c1719] text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Row 1: search | brand | actions */}
        <div className="grid grid-cols-3 items-center h-20">
          <div className="flex items-center gap-1">
            <button className={`${iconBtn} lg:hidden`} onClick={() => setIsMobileMenuOpen((o) => !o)} aria-label="Menu">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button className={iconBtn} onClick={() => setIsSearchOpen((o) => !o)} aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => go({ label: 'Home', section: 'top' })}
            className="flex items-center justify-center gap-3 justify-self-center"
            aria-label="MACCY COLLECTIONS home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-11 h-11 object-contain" />
            <span className="hidden sm:block text-left leading-none">
              <span className="block text-lg font-bold tracking-[0.12em]">MACCY</span>
              <span className="block text-[10px] tracking-[0.3em] text-white/70 mt-1">COLLECTIONS</span>
            </span>
          </button>

          <div className="flex items-center justify-end gap-0.5">
            <button onClick={toggleCurrency} className="hidden sm:block text-xs font-semibold px-3 h-8 rounded-full border border-white/25 hover:bg-white/10 mr-1" title="Switch currency">
              {currency}
            </button>
            <button className={`${iconBtn} hidden sm:flex`} onClick={onOpenTrackOrder} aria-label="Track order" title="Track order">
              <Package className="w-5 h-5" />
            </button>
            <button className={`${iconBtn} relative`} onClick={() => setIsCartOpen(true)} aria-label="Open bag">
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#b8892b] text-[#1c1719] text-[11px] font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search drawer */}
        {isSearchOpen && (
          <form onSubmit={submitSearch} className="pb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search products"
                className="w-full bg-white/10 border border-white/20 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/50 outline-hidden focus:border-[#b8892b]"
              />
            </div>
          </form>
        )}

        {/* Row 2: category menu (desktop) */}
        <nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pb-5 pt-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              className={`text-[15px] tracking-wide text-white/90 hover:text-white transition-colors pb-0.5 border-b ${
                isActive(item) ? 'border-white text-white' : 'border-transparent hover:border-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#1c1719] px-4 py-3 space-y-1 max-h-[75vh] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left text-[15px] ${isActive(item) ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              {item.label}
              <ArrowRight className="w-4 h-4 text-white/40" />
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 mt-2">
            <button onClick={toggleCurrency} className="py-2.5 rounded-lg bg-white/10 text-sm font-semibold">{currency}</button>
            <button onClick={() => { setIsMobileMenuOpen(false); onOpenTrackOrder(); }} className="py-2.5 rounded-lg bg-white/10 text-sm">Track</button>
          </div>
        </div>
      )}
    </header>
  );
}
