'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { 
  X, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  TrendingUp, 
  Package, 
  Scissors, 
  Layers, 
  DollarSign, 
  AlertCircle,
  LogOut,
  MapPin,
  Download,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Product } from '@/types';
import { MessageSquare, Tags } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { 
    categories,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    addCategory,
    updateCategory,
    deleteCategory,
    enquiries,
    markEnquiryReplied,
    deleteEnquiry,
    isAdmin, 
    loginAdmin, 
    logoutAdmin, 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleStock,
    orders, 
    updateOrderStatus, 
    tailoringRequests, 
    updateTailoringStatus, 
    formatPrice,
    sendWhatsAppMessage
  } = useShop();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [locked, setLocked] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'banners' | 'orders' | 'tailoring' | 'enquiries' | 'settings'>('overview');

  // Product form state (add + edit)
  const emptyForm = {
    name: '', category: '', price: '', originalPrice: '', stock: '', description: '', sizes: '', colors: '',
    images: [] as string[], inStock: true, featured: false, bestSeller: false, isNew: false,
  };
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catMessage, setCatMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signingIn || locked) return;
    setPinError('');
    setSigningIn(true);
    const result = await loginAdmin(emailInput, pinInput);
    setSigningIn(false);
    setPinInput('');
    if (!result.ok) {
      setPinError(result.message || 'Login failed.');
      if (result.locked) setLocked(true);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const activeOrdersCount = orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length;
  const pendingTailoringCount = tailoringRequests.filter(t => t.status !== 'completed').length;
  const lowStockProducts = products.filter(p => p.stockCount <= 5);

  // Shrink uploaded photos so they fit in browser storage
  const resizeImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const max = 900;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const resizeBannerImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = await Promise.all(files.map(resizeImage));
    setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    e.target.value = '';
  };

  const openAddProduct = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?.id || '' });
    setFormError('');
    setIsProductFormOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category: p.category, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', stock: String(p.stockCount),
      description: p.description, sizes: p.sizes.join(', '), colors: p.colors.join(', '),
      images: p.images, inStock: p.inStock, featured: !!p.featured, bestSeller: !!p.bestSeller, isNew: !!p.isNew,
    });
    setFormError('');
    setIsProductFormOpen(true);
  };

  const splitList = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find(c => c.id === form.category);
    if (!form.name.trim() || !cat) { setFormError('Please enter a name and choose a category.'); return; }
    if (form.price === '' || Number(form.price) < 0) { setFormError('Please enter a price.'); return; }
    const data = {
      name: form.name.trim(),
      category: cat.id,
      categoryName: cat.name,
      price: Number(form.price),
      originalPrice: form.originalPrice !== '' && Number(form.originalPrice) > Number(form.price) ? Number(form.originalPrice) : undefined,
      description: form.description.trim(),
      features: [] as string[],
      images: form.images,
      sizes: splitList(form.sizes),
      colors: splitList(form.colors),
      inStock: form.inStock,
      stockCount: Number(form.stock) || 0,
      featured: form.featured,
      bestSeller: form.bestSeller,
      isNew: form.isNew,
    };
    if (editingId) updateProduct(editingId, data);
    else addProduct(data);
    setIsProductFormOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (addCategory(newCatName, newCatDesc)) {
      setNewCatName(''); setNewCatDesc(''); setCatMessage('Category added. It now appears in the menu and on the home page.');
    }
  };

  const handleExportData = () => {
    const data = {
      store: "MACCY COLLECTIONS",
      exportedAt: new Date().toISOString(),
      inventory: products,
      orders,
      tailoringRequests
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maccy-collections-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] bg-[#fcf8f1] text-[#2a2629] rounded-lg shadow-2xl flex flex-col border border-[#2a26291f] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navbar */}
        <div className="bg-[#f3ebdd] px-6 py-4 flex items-center justify-between border-b border-[#2a262914] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#fcf8f1] border border-[#2a26291f] flex items-center justify-center text-[#2a2629] font-mono font-bold text-sm">
              M
            </div>
            <div>
              <h2 className="font-tight text-sm sm:text-base font-bold text-[#2a2629] flex items-center gap-2">
                MACCY Admin
                <span className="font-mono text-[9px] uppercase tracking-wider bg-[#6b1429]/20 border border-[#6b1429]/40 px-2 py-0.5 rounded-sm text-[#2a2629]">
                  STAFF
                </span>
              </h2>
              <p className="font-mono text-[10px] text-[#8d8388]">
                MACCY COLLECTIONS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => { logoutAdmin(); }}
                className="flex items-center gap-1.5 font-mono text-xs text-[#5f565a] hover:text-[#2a2629] px-3 py-1.5 rounded-md bg-[#fcf8f1] border border-[#2a262914] hover:border-[#2a262928] transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-[#fcf8f1] hover:bg-[#eadfcc] text-[#5f565a] hover:text-[#2a2629] flex items-center justify-center transition-colors border border-[#2a26291f]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 flex-1">
            <div className="w-12 h-12 rounded-md bg-[#f3ebdd] border border-[#2a26291f] flex items-center justify-center text-[#2a2629]">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="font-tight text-2xl font-bold text-[#2a2629]">Staff sign-in</h3>
              <p className="font-tight text-xs text-[#5f565a]">
                Authorised staff only.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3 text-left" autoComplete="on">
              <div>
                <label htmlFor="admin-id" className="block text-xs font-medium text-[#4a4347] mb-1">Email or username</label>
                <input
                  id="admin-id"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={locked}
                  className="w-full py-2.5 px-4 bg-[#f3ebdd] border border-[#2a26291f] rounded-md text-[#2a2629] focus:border-[#6b1429] outline-hidden disabled:opacity-50"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="admin-pw" className="block text-xs font-medium text-[#4a4347] mb-1">Password</label>
                <div className="relative">
                  <input
                    id="admin-pw"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    disabled={locked}
                    className="w-full py-2.5 pl-4 pr-16 bg-[#f3ebdd] border border-[#2a26291f] rounded-md text-[#2a2629] focus:border-[#6b1429] outline-hidden disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b1429]">
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {pinError && (
                <p role="alert" className="text-xs text-[#b3261e] bg-[#b3261e]/8 border border-[#b3261e]/20 rounded-md px-3 py-2">{pinError}</p>
              )}
              <button
                type="submit"
                disabled={locked || signingIn}
                className="w-full shade-button-primary py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {signingIn ? 'Signing in…' : locked ? 'Locked' : 'Sign in'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs (Shade Navigation Bar) */}
            <div className="bg-[#f3ebdd] border-b border-[#2a262914] px-6 flex items-center justify-between overflow-x-auto shrink-0">
              <div className="flex gap-1.5 py-2">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'products', label: `Products (${products.length})`, icon: Layers },
                  { id: 'categories', label: `Categories (${categories.length})`, icon: Tags },
                  { id: 'banners', label: `Banners (${banners.length})`, icon: Layers },
                  { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
                  { id: 'tailoring', label: `Tailoring (${tailoringRequests.length})`, icon: Scissors },
                  { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: MessageSquare },
                  { id: 'settings', label: 'System & Export', icon: MapPin },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-[#f3ebdd] text-[#2a2629] border border-[#2a26291f] shadow-xs'
                          : 'text-[#8d8388] hover:text-[#2a2629] hover:bg-[#fcf8f1]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#2a2629]" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeTab === 'products' && (
                <button
                  onClick={openAddProduct}
                  className="flex items-center gap-1.5 shade-button-primary text-xs px-3 py-1.5 font-tight font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              )}
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="shade-card p-5 space-y-1">
                      <div className="flex items-center justify-between text-[#8d8388] text-xs font-mono">
                        <span>LIPA NA M-PESA REVENUE</span>
                        <DollarSign className="w-4 h-4 text-[#1f9d3a]" />
                      </div>
                      <p className="font-tight text-2xl font-bold text-[#2a2629] font-mono">
                        {formatPrice(totalRevenue)}
                      </p>
                      <p className="font-mono text-[10px] text-[#1f9d3a]">Verified via STK Push</p>
                    </div>

                    <div className="shade-card p-5 space-y-1">
                      <div className="flex items-center justify-between text-[#8d8388] text-xs font-mono">
                        <span>ACTIVE ORDERS</span>
                        <Package className="w-4 h-4 text-[#2a2629]" />
                      </div>
                      <p className="font-tight text-2xl font-bold text-[#2a2629] font-mono">
                        {activeOrdersCount}
                      </p>
                      <p className="font-mono text-[10px] text-[#8d8388]">{orders.length} total orders recorded</p>
                    </div>

                    <div className="shade-card p-5 space-y-1">
                      <div className="flex items-center justify-between text-[#8d8388] text-xs font-mono">
                        <span>BESPOKE ATELIER</span>
                        <Scissors className="w-4 h-4 text-[#a8791f]" />
                      </div>
                      <p className="font-tight text-2xl font-bold text-[#2a2629] font-mono">
                        {pendingTailoringCount}
                      </p>
                      <p className="font-mono text-[10px] text-[#a8791f]">Consultations in progress</p>
                    </div>

                    <div className="shade-card p-5 space-y-1">
                      <div className="flex items-center justify-between text-[#8d8388] text-xs font-mono">
                        <span>CATALOG SKUS</span>
                        <Layers className="w-4 h-4 text-[#2a2629]" />
                      </div>
                      <p className="font-tight text-2xl font-bold text-[#2a2629] font-mono">
                        {products.length}
                      </p>
                      <p className="font-mono text-[10px] text-[#8d8388]">
                        {lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock alerts` : 'All items in stock'}
                      </p>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  {lowStockProducts.length > 0 && (
                    <div className="bg-[#f3ebdd] border border-[#fead07]/40 rounded-md p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-[#a8791f] font-bold font-mono">
                        <AlertCircle className="w-4 h-4" />
                        <span>LOW INVENTORY ALERTS:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {lowStockProducts.map(p => (
                          <div key={p.id} className="bg-[#fcf8f1] p-2.5 rounded-md border border-[#2a262914] flex justify-between items-center">
                            <span className="font-tight font-medium text-[#2a2629] line-clamp-1">{p.name}</span>
                            <span className="font-mono font-bold text-[#f9452d] shrink-0 ml-2">{p.stockCount} left</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="shade-card p-5 space-y-3">
                      <h4 className="font-tight text-sm font-bold text-[#2a2629]">Recent Customer Orders</h4>
                      <div className="space-y-2 text-xs">
                        {orders.slice(0, 4).map(o => (
                          <div key={o.id} className="flex justify-between items-center p-2.5 rounded-md bg-[#f3ebdd] border border-[#2a262914]">
                            <div>
                              <p className="font-mono font-bold text-[#2a2629]">{o.orderNumber} • {o.customerName}</p>
                              <p className="font-mono text-[10px] text-[#8d8388]">{o.items.length} items • {o.deliveryCity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-[#2a2629]">{formatPrice(o.totalAmount)}</p>
                              <span className="font-mono text-[9px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-[#29c740]/20 text-[#1f9d3a]">
                                {o.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="shade-card p-5 space-y-3">
                      <h4 className="font-tight text-sm font-bold text-[#2a2629]">Recent Tailoring Requests</h4>
                      <div className="space-y-2 text-xs">
                        {tailoringRequests.slice(0, 4).map(t => (
                          <div key={t.id} className="flex justify-between items-center p-2.5 rounded-md bg-[#f3ebdd] border border-[#2a262914]">
                            <div>
                              <p className="font-mono font-bold text-[#2a2629]">{t.requestNumber} • {t.clientName}</p>
                              <p className="font-tight text-[11px] text-[#5f565a]">{t.garmentType}</p>
                            </div>
                            <button
                              onClick={() => sendWhatsAppMessage(`Hello ${t.clientName}, MACCY COLLECTIONS tailor here regarding request #${t.requestNumber} for ${t.garmentType}. Are you free for a consultation?`)}
                              className="bg-[#29c740]/20 hover:bg-[#29c740] border border-[#29c740]/40 text-[#1f9d3a] hover:text-black px-2.5 py-1 rounded-md text-[11px] font-tight font-bold flex items-center gap-1 transition-all"
                            >
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="shade-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f3ebdd] text-[#8d8388] font-mono font-semibold border-b border-[#2a262914] uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">PRODUCT</th>
                            <th className="p-3.5">CATEGORY</th>
                            <th className="p-3.5">PRICE</th>
                            <th className="p-3.5">STOCK</th>
                            <th className="p-3.5">STATUS</th>
                            <th className="p-3.5 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a26290f]">
                          {products.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-[#8d8388]">No products yet. Click “Add Product” to create the first one.</td></tr>
                          )}
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-[#f3ebdd]/50">
                              <td className="p-3.5 flex items-center gap-3">
                                <img src={p.images[0] || undefined} alt="" className="w-10 h-10 object-cover rounded-md bg-[#fcf8f1] border border-[#2a262914] shrink-0" />
                                <div>
                                  <p className="font-tight font-bold text-[#2a2629] line-clamp-1">{p.name}</p>
                                  <p className="text-[10px] text-[#8d8388] font-mono">ID: {p.id}</p>
                                </div>
                              </td>
                              <td className="p-3.5 text-[#5f565a] font-mono text-[11px]">{p.categoryName}</td>
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-[#2a2629]">{formatPrice(p.price)}</span>
                              </td>
                              <td className="p-3.5">
                                <span className={`font-mono font-semibold ${p.stockCount <= 5 ? 'text-[#f9452d]' : 'text-[#2a2629]'}`}>
                                  {p.stockCount} units
                                </span>
                              </td>
                              <td className="p-3.5">
                                <button
                                  onClick={() => toggleStock(p.id)}
                                  className={`px-2.5 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase transition-colors ${
                                    p.inStock ? 'bg-[#29c740]/20 text-[#1f9d3a] border border-[#29c740]/40' : 'bg-[#f9452d]/20 text-[#f9452d] border border-[#f9452d]/40'
                                  }`}
                                >
                                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                                </button>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditProduct(p)}
                                    className="p-1.5 text-[#5f565a] hover:text-[#2a2629] hover:bg-[#f3ebdd] rounded-md transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                        deleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1.5 text-[#8d8388] hover:text-[#f9452d] hover:bg-[#f9452d]/10 rounded-md transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddCategory} className="shade-card p-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end text-xs">
                    <div>
                      <label className="block text-[#5f565a] mb-1">New category name *</label>
                      <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Kids Wear" className="w-full bg-[#fcf8f1] border border-[#2a26291f] rounded-md px-3 py-2 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-[#5f565a] mb-1">Description</label>
                      <input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} className="w-full bg-[#fcf8f1] border border-[#2a26291f] rounded-md px-3 py-2 outline-hidden" />
                    </div>
                    <button type="submit" className="shade-button-primary px-4 py-2 text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add</button>
                  </form>
                  {catMessage && <p className="text-xs text-[#1f9d3a]">{catMessage}</p>}
                  <div className="shade-card divide-y divide-[#2a26290f]">
                    {categories.map(c => {
                      const count = products.filter(p => p.category === c.id).length;
                      return (
                        <div key={c.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2a2629] text-sm">{c.name}</p>
                            <p className="text-[#8d8388] truncate">{c.description || 'No description'} · {count} {count === 1 ? 'product' : 'products'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                const name = prompt('Category name:', c.name);
                                if (name && name.trim()) {
                                  const description = prompt('Category description (optional):', c.description || '') ?? c.description;
                                  updateCategory(c.id, { name: name.trim(), description: description?.trim() || undefined });
                                }
                              }}
                              className="p-1.5 text-[#5f565a] hover:bg-[#f3ebdd] rounded-md" title="Rename / edit"
                            ><Edit3 className="w-3.5 h-3.5" /></button>
                            <button
                              onClick={() => {
                                if (!confirm(`Delete category "${c.name}"?`)) return;
                                if (!deleteCategory(c.id)) alert('This category still has products. Move or delete them first.');
                              }}
                              className="p-1.5 text-[#8d8388] hover:text-[#f9452d] hover:bg-[#f9452d]/10 rounded-md" title="Delete"
                            ><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Banners Tab */}
              {activeTab === 'banners' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#5f565a]">These are the slides at the top of the home page. Upload your own photos, change the text, or remove slides.</p>
                  <button
                    onClick={() => addBanner({ title: 'New slide', subtitle: '', buttonLabel: 'Shop now', link: 'catalog' })}
                    className="shade-button-primary px-4 py-2 text-xs flex items-center gap-1.5"
                  ><Plus className="w-3.5 h-3.5" /> Add slide</button>
                  {banners.map((b) => (
                    <div key={b.id} className="shade-card p-4 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="aspect-video rounded-lg bg-[#3a1220] overflow-hidden border border-[#2a262914]">
                          {b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-[11px]"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) updateBanner(b.id, { image: await resizeBannerImage(f) });
                            e.target.value = '';
                          }}
                        />
                        {b.image && <button onClick={() => updateBanner(b.id, { image: undefined })} className="text-[#6b1429] hover:underline">Remove photo</button>}
                      </div>
                      <div className="space-y-2">
                        <input className="w-full bg-white border border-[#2a26291f] rounded-lg px-3 py-2 text-sm font-medium" value={b.title} onChange={(e) => updateBanner(b.id, { title: e.target.value })} placeholder="Title" />
                        <textarea className="w-full bg-white border border-[#2a26291f] rounded-lg px-3 py-2" rows={2} value={b.subtitle || ''} onChange={(e) => updateBanner(b.id, { subtitle: e.target.value })} placeholder="Short text" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input className="bg-white border border-[#2a26291f] rounded-lg px-3 py-2" value={b.buttonLabel || ''} onChange={(e) => updateBanner(b.id, { buttonLabel: e.target.value })} placeholder="Button text (leave empty for none)" />
                          <select className="bg-white border border-[#2a26291f] rounded-lg px-3 py-2" value={b.link} onChange={(e) => updateBanner(b.id, { link: e.target.value })}>
                            <option value="catalog">Button goes to: All products</option>
                            <option value="tailoring">Button goes to: Custom tailoring</option>
                            <option value="contact">Button goes to: Contact</option>
                            {categories.filter(c => c.id !== 'custom_tailoring').map(c => <option key={c.id} value={c.id}>Button goes to: {c.name}</option>)}
                          </select>
                        </div>
                        <button onClick={() => confirm('Delete this slide?') && deleteBanner(b.id)} className="text-[#f9452d] hover:underline flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete slide</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enquiries Tab */}
              {activeTab === 'enquiries' && (
                <div className="space-y-3">
                  {enquiries.length === 0 && <p className="text-center text-[#8d8388] text-sm py-10">No customer enquiries yet.</p>}
                  {enquiries.map(q => (
                    <div key={q.id} className="shade-card p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#2a2629]">{q.name} <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${q.status === 'new' ? 'bg-[#a8791f]/15 text-[#a8791f]' : 'bg-[#1f9d3a]/15 text-[#1f9d3a]'}`}>{q.status}</span></p>
                        <span className="text-[#8d8388]">{new Date(q.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[#4a4347] whitespace-pre-wrap">{q.message}</p>
                      <div className="flex items-center gap-3 flex-wrap text-[#5f565a]">
                        {q.phone && <a className="hover:underline" href={`https://wa.me/${q.phone.replace(/\D/g, '').replace(/^0/, '254')}`} target="_blank" rel="noopener noreferrer">WhatsApp {q.phone}</a>}
                        {q.email && <a className="hover:underline" href={`mailto:${q.email}`}>{q.email}</a>}
                        <span className="flex-1" />
                        {q.status === 'new' && <button onClick={() => markEnquiryReplied(q.id)} className="shade-button-secondary px-3 py-1">Mark replied</button>}
                        <button onClick={() => deleteEnquiry(q.id)} className="p-1.5 text-[#8d8388] hover:text-[#f9452d]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="shade-card p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a262914] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#2a2629]">
                            ORDER #{o.orderNumber}
                          </span>
                          <span className="font-mono text-[10px] text-[#8d8388] ml-2">
                            {new Date(o.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[#8d8388]">STATUS:</span>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className="bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-1 font-mono text-[11px] font-bold text-[#2a2629] uppercase outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_preparation">In Preparation</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => sendWhatsAppMessage(`Hello ${o.customerName}! Order #${o.orderNumber} from MACCY COLLECTIONS is now ${o.orderStatus.toUpperCase()}. Please let us know if you need assistance!`)}
                            className="bg-[#29c740]/20 hover:bg-[#29c740] border border-[#29c740]/40 text-[#1f9d3a] hover:text-black px-3 py-1 rounded-md text-xs font-tight font-bold flex items-center gap-1 transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Notify on WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        <div>
                          <p className="font-bold text-[#2a2629] mb-1 font-tight">Customer:</p>
                          <p className="text-[#4a4347]">{o.customerName}</p>
                          <p className="text-[#8d8388]">{o.phone}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2a2629] mb-1 font-tight">Delivery:</p>
                          <p className="capitalize text-[#4a4347]">{o.deliveryMethod.replace('_', ' ')}</p>
                          <p className="text-[#8d8388]">{o.deliveryAddress}, {o.deliveryCity}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2a2629] mb-1 font-tight">Payment:</p>
                          <p className="uppercase text-[#1f9d3a] font-bold">{o.paymentStatus}</p>
                          <p className="text-base font-bold text-[#2a2629] mt-1">{formatPrice(o.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tailoring Tab */}
              {activeTab === 'tailoring' && (
                <div className="space-y-3">
                  {tailoringRequests.map(t => (
                    <div key={t.id} className="shade-card p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a262914] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#2a2629]">
                            REQUEST #{t.requestNumber}
                          </span>
                          <span className="font-mono text-[10px] text-[#8d8388] ml-2">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={t.status}
                            onChange={(e) => updateTailoringStatus(t.id, e.target.value as any)}
                            className="bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-1 font-mono text-[11px] font-bold text-[#2a2629] uppercase outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="consultation_scheduled">Consultation Scheduled</option>
                            <option value="measuring">Measuring</option>
                            <option value="cutting_stitching">Cutting & Stitching</option>
                            <option value="ready_for_fitting">Ready for Fitting</option>
                            <option value="completed">Completed</option>
                          </select>

                          <button
                            onClick={() => sendWhatsAppMessage(`Hello ${t.clientName}, MACCY COLLECTIONS tailor here regarding request #${t.requestNumber} for ${t.garmentType}. Are you free for a consultation?`)}
                            className="bg-[#29c740]/20 hover:bg-[#29c740] border border-[#29c740]/40 text-[#1f9d3a] hover:text-black px-3 py-1 rounded-md text-xs font-tight font-bold flex items-center gap-1 transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp Client</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        <div>
                          <p className="font-bold text-[#2a2629] font-tight">Client:</p>
                          <p className="text-[#4a4347]">{t.clientName}</p>
                          <p className="text-[#8d8388]">{t.phone}</p>
                          <p className="mt-1 text-[#5f565a]">Occasion: {t.occasion}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2a2629] font-tight">Garment & Fabric:</p>
                          <p className="text-[#4a4347]">{t.garmentType}</p>
                          <p className="text-[#8d8388]">{t.fabricChoice}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2a2629] font-tight">Inspiration:</p>
                          {t.inspirationImageUrl ? (
                            <img src={t.inspirationImageUrl} alt="" className="w-16 h-16 object-cover rounded-md border border-[#2a26291f] mt-1" />
                          ) : (
                            <p className="text-[#8d8388] italic">No image</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="shade-card p-6 space-y-5 max-w-xl">
                  <h3 className="font-tight text-base font-bold text-[#2a2629]">Store Protocol & Backup Export</h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block text-[#8d8388] mb-1">PHYSICAL ATELIER LOCATION</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="Total Petrol Station, Maasai Mara University Junction, Narok, Kenya" 
                        className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-[#2a2629] font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[#8d8388] mb-1">WHATSAPP CONCIERGE LINE</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="+254 722 907 700 (0722 907 700)" 
                        className="w-full bg-[#f3ebdd] border border-[#2a26291f] rounded-md px-3 py-2 text-[#2a2629] font-mono" 
                      />
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <p className="text-[#5f565a] font-tight text-xs">Backup all catalog, orders, and tailoring:</p>
                      <button
                        onClick={handleExportData}
                        className="shade-button-secondary px-4 py-2 text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#2a2629]" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add / Edit Product */}
        {isProductFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#fcf8f1] text-[#2a2629] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 border border-[#2a26291f] shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#2a262914] pb-3">
                <h3 className="text-lg font-semibold text-[#6b1429]">{editingId ? 'Edit product' : 'Add product'}</h3>
                <button onClick={() => setIsProductFormOpen(false)}><X className="w-5 h-5 text-[#8d8388]" /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                {categories.length === 0 && <p className="text-[#f9452d]">Create a category first (Categories tab).</p>}
                {(() => {
                  const inp = 'w-full bg-white border border-[#2a26291f] rounded-lg px-3 py-2 text-[#2a2629] outline-hidden';
                  const lbl = 'block text-[11px] text-[#5f565a] mb-1';
                  return (
                    <>
                      <div>
                        <label className={lbl}>Product name *</label>
                        <input className={inp} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Category *</label>
                          <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Price (KSh) *</label>
                          <input className={inp} type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div>
                          <label className={lbl}>Old price (optional, shows a Sale badge)</label>
                          <input className={inp} type="number" min="0" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                        </div>
                        <div>
                          <label className={lbl}>Units in stock</label>
                          <input className={inp} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Sizes (comma separated)</label>
                          <input className={inp} placeholder="e.g. S, M, L or 40, 41, 42" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
                        </div>
                        <div>
                          <label className={lbl}>Colours (comma separated)</label>
                          <input className={inp} placeholder="e.g. Black, Burgundy" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Description</label>
                        <textarea className={inp} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      </div>
                      <div>
                        <label className={lbl}>Product images (first image is the main one)</label>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-xs" />
                        {form.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {form.images.map((img, i) => (
                              <div key={i} className="relative">
                                <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#2a26291f]" />
                                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1.5 -right-1.5 bg-[#6b1429] text-white rounded-full w-5 h-5 flex items-center justify-center"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                        {([['inStock', 'Available'], ['featured', 'Featured'], ['isNew', 'New arrival'], ['bestSeller', 'Best seller']] as const).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="accent-[#6b1429]" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                            {label}
                          </label>
                        ))}
                      </div>
                    </>
                  );
                })()}
                {formError && <p className="text-[#f9452d]">{formError}</p>}
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsProductFormOpen(false)} className="shade-button-secondary px-4 py-2 text-xs">Cancel</button>
                  <button type="submit" className="shade-button-primary px-5 py-2 text-xs font-semibold">Save product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
