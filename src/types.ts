export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  hasComplements?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  isCustomized?: boolean;
  personalizationName?: string;
  hasExtraComplement?: boolean;
  complementDescription?: string;
  imageUrl?: string;
}

export interface Order {
  id?: string;
  customerName: string;
  customerWhatsapp: string;
  items: OrderItem[];
  total: number;
  shippingCost?: number;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
  paymentMethod?: 'pix' | 'credit' | 'debit';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
  customizationData?: string; // base64 representation of PNG
}

export interface Settings {
  whatsappNumber: string;
  emailLink: string;
  instagram?: string;
  facebook?: string;
}
