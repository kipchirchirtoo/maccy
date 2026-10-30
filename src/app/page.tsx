'use client';

import React, { useState, useMemo } from 'react';
import { useShop } from '@/context/ShopContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { TailoringStudio } from '@/components/TailoringStudio';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import { Product } from '@/types';
import { 
  Sparkles, 
  ArrowUpDown, 
  Scissors, 
  Search, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function HomePage() {
  const { 
    products, 
    categories,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    sendWhatsAppMessage
  } = useShop();

  // Modals state
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);

  // Filters state
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Section navigation helper
  const navigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  // Filtered & sorted products computation
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // In stock filter
      if (inStockOnly && !product.inStock) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.categoryName.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, inStockOnly, searchQuery, sortBy]);

  const grid = (list: Product[]) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-8">
      {list.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={(p) => setSelectedProductForModal(p)} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf8f1] text-[#2a2629] font-sans selection:bg-[#6b1429] selection:text-white">
      <Navbar
        onOpenTrackOrder={() => setIsTrackOrderModalOpen(true)}
        onNavigateSection={navigateToSection}
      />

      <Hero
        onNavigate={(link) => {
          if (link === 'tailoring' || link === 'contact') return navigateToSection(link);
          if (link !== 'catalog') setSelectedCategory(link);
          else setSelectedCategory('all');
          navigateToSection('catalog');
        }}
      />

      <main className="flex-1">
        <div className="bg-white">
        {/* SHOP BY CATEGORY */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <h2 className="text-3xl sm:text-5xl">Shop by <span className="italic font-serif">category</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = products.filter(p => p.category === cat.id).length;
              const isTailoring = cat.id === 'custom_tailoring';
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (isTailoring) { navigateToSection('tailoring'); return; }
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                    navigateToSection('catalog');
                  }}
                  className="shade-card p-6 text-left space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#6b1429]">{cat.name}</h3>
                    <ArrowRight className="w-4 h-4 text-[#8d8388] group-hover:translate-x-1 transition-transform" />
                  </div>
                  {cat.description && <p className="text-sm text-[#5f565a] leading-relaxed">{cat.description}</p>}
                  <p className="text-xs text-[#8d8388]">{isTailoring ? 'Made to measure' : `${count} ${count === 1 ? 'product' : 'products'}`}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* FEATURED / NEW / BEST SELLERS (only shown when the admin has marked products) */}
        {featuredProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
            <h2 className="text-2xl sm:text-3xl !font-sans !font-bold !text-[#121212]">Featured products</h2>
            {grid(featuredProducts)}
          </section>
        )}
        {newArrivals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
            <h2 className="text-2xl sm:text-3xl !font-sans !font-bold !text-[#121212]">New arrivals</h2>
            {grid(newArrivals)}
          </section>
        )}
        {bestSellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
            <h2 className="text-2xl sm:text-3xl !font-sans !font-bold !text-[#121212]">Best sellers</h2>
            {grid(bestSellers)}
          </section>
        )}

        {/* COLLECTION ROWS: one per category that has products */}
        {categories
          .filter((c) => c.id !== 'custom_tailoring' && products.some((p) => p.category === c.id))
          .map((c) => (
            <section key={c.id} className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 space-y-6">
              <h2 className="text-2xl sm:text-3xl !font-sans !font-bold !text-[#121212]">{c.name}</h2>
              {grid(products.filter((p) => p.category === c.id).slice(0, 4))}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => { setSelectedCategory(c.id); setSearchQuery(''); navigateToSection('catalog'); }}
                  className="border border-[#121212] hover:bg-[#121212] hover:text-white px-10 py-3 text-[15px] tracking-wide transition-colors"
                >
                  View all
                </button>
              </div>
            </section>
          ))}

        {/* CATALOG: all products or one category */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8 border-t border-[#2a262914]">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl">
              {activeCategory ? activeCategory.name : <>All <span className="italic font-serif">products</span></>}
            </h2>
            {activeCategory?.description && <p className="text-[#5f565a]">{activeCategory.description}</p>}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[{ id: 'all', name: 'All' }, ...categories].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${
                    isActive ? 'bg-[#6b1429] text-white border-[#6b1429]' : 'bg-white text-[#4a4347] border-[#2a262920] hover:border-[#6b1429]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="shade-card px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8d8388] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products"
                  className="pl-9 pr-3 py-2 rounded-full bg-[#fcf8f1] border border-[#2a26291f] text-sm outline-hidden focus:border-[#6b1429]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-[#6b1429]" />
                <span>In stock only</span>
              </label>
              <span className="text-[#8d8388]">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#6b1429]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')}
                className="bg-[#fcf8f1] border border-[#2a26291f] rounded-full px-3 py-2 text-sm outline-hidden"
              >
                <option value="featured">Featured first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            grid(filteredProducts)
          ) : (
            <div className="shade-card py-16 text-center space-y-3 p-8">
              <Search className="w-8 h-8 text-[#8d8388] mx-auto" />
              <h3 className="text-lg font-semibold">
                {products.length === 0 ? 'Products are coming soon' : 'No products match your search'}
              </h3>
              <p className="text-sm text-[#5f565a] max-w-sm mx-auto">
                {products.length === 0
                  ? 'No products are listed yet. Message us on WhatsApp to ask what is available.'
                  : 'Try another category or clear your search, or ask us on WhatsApp.'}
              </p>
              <div className="flex justify-center gap-2 pt-2">
                {products.length > 0 && (
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setInStockOnly(false); }}
                    className="shade-button-secondary text-sm px-5 py-2"
                  >
                    Reset filters
                  </button>
                )}
                <button
                  onClick={() => sendWhatsAppMessage('Hello MACCY COLLECTIONS! I would like to ask what is available.')}
                  className="shade-button-primary text-sm px-5 py-2"
                >
                  Ask on WhatsApp
                </button>
              </div>
            </div>
          )}
        </section>

        </div>

        <TailoringStudio />
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateSection={navigateToSection}
        onOpenTrackOrder={() => setIsTrackOrderModalOpen(true)}
      />

      {/* Modals & Slide-overs */}
      <CartDrawer 
        onProceedCheckout={() => setIsCheckoutModalOpen(true)}
      />

      <ProductDetailModal
        key={selectedProductForModal?.id ?? 'none'}
        product={selectedProductForModal}
        onSelectProduct={(p) => setSelectedProductForModal(p)}
        onClose={() => setSelectedProductForModal(null)}
      />

      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderCompleted={() => {}}
      />

      <OrderTrackingModal 
        isOpen={isTrackOrderModalOpen}
        onClose={() => setIsTrackOrderModalOpen(false)}
      />
    </div>
  );
}
