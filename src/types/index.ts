export type ProductCategory = string;

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status: 'new' | 'replied';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  price: number; // in KSh
  originalPrice?: number;
  description: string;
  features: string[];
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  stockCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  rating?: number;
  reviewsCount?: number;
  isNew?: boolean;
  fabricDetails?: string;
  culturalStory?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface TailoringMeasurements {
  chest?: string;
  shoulders?: string;
  sleeveLength?: string;
  waist?: string;
  hips?: string;
  inseam?: string;
  height?: string;
  neck?: string;
  notes?: string;
  fittingPreference: 'standard' | 'slim' | 'relaxed' | 'in_person_fitting';
}

export interface TailoringRequest {
  id: string;
  requestNumber: string;
  clientName: string;
  phone: string;
  email?: string;
  garmentType: string;
  occasion: string;
  eventDate?: string;
  fabricChoice: string;
  size?: string;
  colour?: string;
  measurements: TailoringMeasurements;
  inspirationImageUrl?: string;
  additionalDetails?: string;
  budgetRange?: string;
  status: 'pending' | 'consultation_scheduled' | 'measuring' | 'cutting_stitching' | 'ready_for_fitting' | 'completed';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryMethod: 'pickup' | 'narok_delivery' | 'nationwide_parcel' | 'international';
  deliveryAddress: string;
  deliveryCity: string;
  paymentMethod: 'mpesa_express' | 'whatsapp_order' | 'cash_on_pickup';
  paymentStatus: 'paid' | 'pending' | 'cash_on_delivery';
  mpesaCode?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'in_preparation' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  // 'catalog', 'tailoring', 'contact', or a category id
  link: string;
  image?: string;
}
