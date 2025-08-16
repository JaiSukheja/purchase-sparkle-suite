export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  customer_id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchase_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  user_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  purchase_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}