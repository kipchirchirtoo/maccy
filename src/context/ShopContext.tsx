'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, TailoringRequest, Category, Enquiry, Banner } from '@/types';
import { INITIAL_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_BANNERS } from '@/data/products';
import confetti from 'canvas-confetti';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  addBanner: (b: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  enquiries: Enquiry[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  tailoringRequests: TailoringRequest[];
  currency: 'KSH' | 'USD';
  isCartOpen: boolean;
  isAdmin: boolean;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  setIsCartOpen: (open: boolean) => void;
  toggleCurrency: () => void;
  formatPrice: (amountKsh: number) => string;
  
  // Cart
  addToCart: (product: Product, size?: string, color?: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  totalCartItems: number;
  cartSubtotal: number;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  findOrder: (orderNumber: string) => Order | undefined;

  // Tailoring
  createTailoringRequest: (request: Omit<TailoringRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => TailoringRequest;
  updateTailoringStatus: (id: string, status: TailoringRequest['status']) => void;

  // Admin & Products
  setIsAdmin: (v: boolean) => void;
  loginAdmin: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string; locked?: boolean; attemptsLeft?: number }>;
  logoutAdmin: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  addCategory: (name: string, description?: string) => Category | null;
  updateCategory: (id: string, updates: Partial<Pick<Category, 'name' | 'description'>>) => void;
  deleteCategory: (id: string) => boolean;

  // Enquiries
  submitEnquiry: (e: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => void;
  markEnquiryReplied: (id: string) => void;
  deleteEnquiry: (id: string) => void;

  // WhatsApp
  sendWhatsAppMessage: (message: string) => void;
  getWhatsAppProductUrl: (product: Product) => string;
  getWhatsAppOrderUrl: (order: Order) => string;
  getWhatsAppTailoringUrl: (request: TailoringRequest) => string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const WHATSAPP_NUMBER = '254722907700'; // 0722 907 700
const USD_RATE = 130; // 1 USD = 130 KSh

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tailoringRequests, setTailoringRequests] = useState<TailoringRequest[]>([]);
  const [currency, setCurrency] = useState<'KSH' | 'USD'>('KSH');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    const read = <T,>(key: string): T | null => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    };
    queueMicrotask(() => {
      const savedProducts = read<Product[]>('maccy_products_v2');
      if (savedProducts) setProducts(savedProducts);
      const savedCategories = read<Category[]>('maccy_categories_v2');
      if (savedCategories) setCategories(savedCategories);
      const savedCart = read<CartItem[]>('maccy_cart');
      if (savedCart) setCart(savedCart);
      const savedWishlist = read<string[]>('maccy_wishlist');
      if (savedWishlist) setWishlist(savedWishlist);
      const savedOrders = read<Order[]>('maccy_orders_v2');
      if (savedOrders) setOrders(savedOrders);
      const savedTailoring = read<TailoringRequest[]>('maccy_tailoring_v2');
      if (savedTailoring) setTailoringRequests(savedTailoring);
      const savedBanners = read<Banner[]>('maccy_banners_v2');
      if (savedBanners) setBanners(savedBanners);
      const savedEnquiries = read<Enquiry[]>('maccy_enquiries_v2');
      if (savedEnquiries) setEnquiries(savedEnquiries);
      setHydrated(true);
    });
  }, []);

  // Save only after the initial load so saved data is never overwritten by defaults
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('maccy_products_v2', JSON.stringify(products)); } catch { console.warn('Browser storage is full; product changes were not saved.'); }
  }, [products, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_categories_v2', JSON.stringify(categories)); }, [categories, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_cart', JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_wishlist', JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_orders_v2', JSON.stringify(orders)); }, [orders, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_tailoring_v2', JSON.stringify(tailoringRequests)); }, [tailoringRequests, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('maccy_banners_v2', JSON.stringify(banners)); } catch { console.warn('Browser storage is full; banner changes were not saved.'); }
  }, [banners, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('maccy_enquiries_v2', JSON.stringify(enquiries)); }, [enquiries, hydrated]);

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'KSH' ? 'USD' : 'KSH'));
  };

  const formatPrice = (amountKsh: number) => {
    if (currency === 'USD') {
      const usd = (amountKsh / USD_RATE).toFixed(2);
      return `$${usd}`;
    }
    return `KSh ${amountKsh.toLocaleString()}`;
  };

  // Cart actions
  const addToCart = (product: Product, size?: string, color?: string, qty = 1) => {
    const selectedSize = size || product.sizes[0] || 'Standard';
    const selectedColor = color || product.colors[0] || 'Default';

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [...prev, { product, selectedSize, selectedColor, quantity: qty }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order creation
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `MC-${randNum}`,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5a0e1f', '#d4af37', '#fdfbf7', '#b52544']
      });
    } catch {}

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
  };

  const findOrder = (orderNumber: string) => {
    const cleaned = orderNumber.trim().toUpperCase();
    return orders.find(o => o.orderNumber.toUpperCase() === cleaned);
  };

  // Tailoring creation
  const createTailoringRequest = (
    requestData: Omit<TailoringRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>
  ): TailoringRequest => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newRequest: TailoringRequest = {
      ...requestData,
      id: `tailor-${Date.now()}`,
      requestNumber: `MCT-${randNum}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTailoringRequests(prev => [newRequest, ...prev]);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#5a0e1f', '#d4af37', '#b89327']
      });
    } catch {}

    return newRequest;
  };

  const updateTailoringStatus = (id: string, status: TailoringRequest['status']) => {
    setTailoringRequests(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  // Categories (admin-managed)
  const addCategory = (name: string, description?: string) => {
    const clean = name.trim();
    if (!clean) return null;
    let id = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `cat_${Date.now()}`;
    if (categories.some(c => c.id === id)) id = `${id}_${Date.now()}`;
    const category: Category = { id, name: clean, description: description?.trim() || undefined };
    setCategories(prev => [...prev, category]);
    return category;
  };

  const updateCategory = (id: string, updates: Partial<Pick<Category, 'name' | 'description'>>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    if (updates.name) {
      setProducts(prev => prev.map(p => (p.category === id ? { ...p, categoryName: updates.name as string } : p)));
    }
  };

  // A category that still has products cannot be deleted
  const deleteCategory = (id: string) => {
    if (products.some(p => p.category === id)) return false;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (selectedCategory === id) setSelectedCategory('all');
    return true;
  };

  // Hero banners (admin-managed)
  const addBanner = (b: Omit<Banner, 'id'>) => setBanners(prev => [...prev, { ...b, id: `banner-${Date.now()}` }]);
  const updateBanner = (id: string, updates: Partial<Banner>) => setBanners(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  const deleteBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  // Customer enquiries
  const submitEnquiry = (e: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => {
    setEnquiries(prev => [{ ...e, id: `enq-${Date.now()}`, status: 'new', createdAt: new Date().toISOString() }, ...prev]);
  };
  const markEnquiryReplied = (id: string) => setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, status: 'replied' } : e)));
  const deleteEnquiry = (id: string) => setEnquiries(prev => prev.filter(e => e.id !== id));

  // Admin authentication is verified by the server (httpOnly session cookie); see /api/admin/*
  const loginAdmin = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setIsAdmin(true);
        return { ok: true };
      }
      return { ok: false, message: data.message || 'Login failed.', locked: !!data.locked, attemptsLeft: data.attemptsLeft };
    } catch {
      return { ok: false, message: 'Could not reach the server.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setIsAdmin(false);
    }
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStock = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  // WhatsApp helpers
  const sendWhatsAppMessage = (message: string) => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const getWhatsAppProductUrl = (product: Product) => {
    const message = `Hello MACCY COLLECTIONS! I'm interested in:\n\n*${product.name}*\nPrice: KSh ${product.price.toLocaleString()}\nCategory: ${product.categoryName}\n\nIs this currently available at your Total Petrol Station boutique near Maasai Mara University?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const getWhatsAppOrderUrl = (order: Order) => {
    const itemsList = order.items.map(i => `• ${i.productName} (${i.selectedSize}, ${i.selectedColor}) x${i.quantity} = KSh ${(i.price * i.quantity).toLocaleString()}`).join('\n');
    const message = `*NEW ORDER - MACCY COLLECTIONS*\nOrder No: *${order.orderNumber}*\nCustomer: ${order.customerName}\nPhone: ${order.phone}\n\n*Items:*\n${itemsList}\n\n*Total:* KSh ${order.totalAmount.toLocaleString()}\nDelivery: ${order.deliveryMethod} (${order.deliveryAddress})\nPayment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})\n${order.mpesaCode ? `M-Pesa Ref: ${order.mpesaCode}\n` : ''}\nPlease confirm my order!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const getWhatsAppTailoringUrl = (request: TailoringRequest) => {
    const m = request.measurements;
    const measurementsText = [
      m.chest && `Chest: ${m.chest}`,
      m.shoulders && `Shoulders: ${m.shoulders}`,
      m.sleeveLength && `Sleeve: ${m.sleeveLength}`,
      m.waist && `Waist: ${m.waist}`,
      m.hips && `Hips: ${m.hips}`,
      m.inseam && `Inseam: ${m.inseam}`,
      m.height && `Height: ${m.height}`,
      `Fitting: ${m.fittingPreference}`
    ].filter(Boolean).join(', ');

    const message = `*CUSTOM BESPOKE TAILORING REQUEST*\nRequest No: *${request.requestNumber}*\nClient: ${request.clientName}\nPhone: ${request.phone}\nGarment: *${request.garmentType}*\nOccasion: ${request.occasion} ${request.eventDate ? `(Date: ${request.eventDate})` : ''}\nFabric Choice: ${request.fabricChoice}\n\n*Measurements:* ${measurementsText}\n\n${request.additionalDetails ? `Notes: ${request.additionalDetails}\n` : ''}${request.inspirationImageUrl ? `Inspiration attached on platform.\n` : ''}Looking forward to our consultation with MACCY COLLECTIONS!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        enquiries,
        addCategory,
        updateCategory,
        deleteCategory,
        submitEnquiry,
        markEnquiryReplied,
        deleteEnquiry,
        cart,
        wishlist,
        orders,
        tailoringRequests,
        currency,
        isCartOpen,
        isAdmin,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
        setIsCartOpen,
        toggleCurrency,
        formatPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartItems,
        cartSubtotal,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        findOrder,
        createTailoringRequest,
        updateTailoringStatus,
        setIsAdmin,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        sendWhatsAppMessage,
        getWhatsAppProductUrl,
        getWhatsAppOrderUrl,
        getWhatsAppTailoringUrl,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
