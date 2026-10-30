import { Banner, Category, Product } from '@/types';

// No inventory is pre-loaded. Products are added by the store admin from the dashboard.
export const INITIAL_PRODUCTS: Product[] = [];

// Default shop categories (names only). Admins can add, rename or remove categories.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'mens_fashion', name: "Men's Fashion", description: 'Shirts, trousers, outfits and other menswear.' },
  { id: 'footwear', name: 'Shoes & Footwear', description: 'Sneakers, formal shoes, sandals and other footwear.' },
  { id: 'gifts', name: 'Gifts', description: 'Gift sets, special-occasion gifts and gift items.' },
  { id: 'curio', name: 'Curio Products', description: 'Shukas, vitenges, cultural souvenirs and other curio items.' },
  { id: 'accessories', name: 'Fashion Accessories', description: 'Belts, watches, jewellery, bags and other accessories.' },
  { id: 'african_inspired', name: 'African-Inspired Pieces', description: 'Products featuring African-inspired designs and patterns.' },
  { id: 'custom_tailoring', name: 'Custom Tailoring', description: 'Made-to-measure clothing and personalised designs.' },
];

// Starter hero slides. Admins can replace them with their own photos and text from the dashboard.
export const DEFAULT_BANNERS: Banner[] = [
  { id: 'banner-1', title: 'MACCY COLLECTIONS', subtitle: "Men's fashion, shoes, gifts, curio, accessories and African-inspired pieces.", buttonLabel: 'Shop now', link: 'catalog' },
  { id: 'banner-2', title: 'Custom tailoring', subtitle: 'Made to measure and designed just for you.', buttonLabel: 'Request tailoring', link: 'tailoring' },
  { id: 'banner-3', title: 'Visit or message us', subtitle: 'Total Petrol Station, near Maasai Mara University junction. WhatsApp 0722 907 700.', buttonLabel: 'Contact us', link: 'contact' },
];
