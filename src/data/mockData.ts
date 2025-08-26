import { Customer, Purchase, DashboardStats } from "@/types/customer";

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    totalPurchases: 15420,
    lastPurchaseDate: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 987-6543',
    company: 'Design Studio',
    totalPurchases: 8750,
    lastPurchaseDate: new Date('2024-01-12'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 456-7890',
    totalPurchases: 22300,
    lastPurchaseDate: new Date('2024-01-10'),
    status: 'active'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@startup.com',
    phone: '+1 (555) 321-0987',
    company: 'Innovation Labs',
    totalPurchases: 5200,
    lastPurchaseDate: new Date('2024-01-08'),
    status: 'inactive'
  }
];

export const mockPurchases: Purchase[] = [
  {
    id: '1',
    customerId: '1',
    productName: 'Premium Software License',
    quantity: 5,
    unitPrice: 299.99,
    totalAmount: 1499.95,
    date: new Date('2024-01-15'),
    notes: 'Annual license renewal'
  },
  {
    id: '2',
    customerId: '2',
    productName: 'Design Consultation',
    quantity: 10,
    unitPrice: 150.00,
    totalAmount: 1500.00,
    date: new Date('2024-01-12'),
    notes: 'Website redesign project'
  },
  {
    id: '3',
    customerId: '3',
    productName: 'Hardware Equipment',
    quantity: 2,
    unitPrice: 850.00,
    totalAmount: 1700.00,
    date: new Date('2024-01-10')
  }
];

export const mockStats: DashboardStats = {
  totalCustomers: 156,
  totalRevenue: 284750,
  averageOrderValue: 1825,
  recentPurchases: 24
};