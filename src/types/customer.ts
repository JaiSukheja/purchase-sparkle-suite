export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Purchase {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: Date;
  notes?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentPurchases: number;
}