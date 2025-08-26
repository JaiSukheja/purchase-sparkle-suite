import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem, Purchase } from '@/types/database';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationContext } from './useOrganizationContext';

export const useInvoices = (customerId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedOrganizationId } = useOrganizationContext();

  const fetchInvoices = async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id);

    if (selectedOrganizationId) {
      query = query.eq('organization_id', selectedOrganizationId);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching invoices",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setInvoices((data || []) as Invoice[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [user, customerId, selectedOrganizationId]);

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !selectedOrganizationId) return null;

    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoiceData, user_id: user.id, organization_id: selectedOrganizationId }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setInvoices(prev => [data as Invoice, ...prev]);
    toast({
      title: "Invoice created",
      description: "Invoice has been created successfully."
    });
    return data;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setInvoices(prev => prev.map(i => i.id === id ? (data as Invoice) : i));
    toast({
      title: "Invoice updated",
      description: "Invoice has been updated successfully."
    });
    return data;
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error deleting invoice",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    setInvoices(prev => prev.filter(i => i.id !== id));
    toast({
      title: "Invoice deleted",
      description: "Invoice has been deleted successfully."
    });
    return true;
  };

  const generateInvoiceFromPurchases = async (customerId: string, purchaseIds: string[]) => {
    if (!user) return null;

    try {
      // Fetch purchases to calculate totals
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .in('id', purchaseIds)
        .eq('user_id', user.id);

      if (purchasesError) throw purchasesError;

      const subtotal = purchases?.reduce((sum, p) => sum + p.total_amount, 0) || 0;
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const invoiceData = {
        customer_id: customerId,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'draft' as const
      };

      const invoice = await createInvoice(invoiceData);
      if (!invoice) return null;

      // Create invoice items
      const invoiceItems = purchases?.map(purchase => ({
        invoice_id: invoice.id,
        purchase_id: purchase.id,
        description: purchase.product_name,
        quantity: purchase.quantity,
        unit_price: purchase.unit_price,
        total_amount: purchase.total_amount
      })) || [];

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        toast({
          title: "Error creating invoice items",
          description: itemsError.message,
          variant: "destructive"
        });
        return null;
      }

      return invoice;
    } catch (error: any) {
      toast({
        title: "Error generating invoice",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceFromPurchases,
    refetch: fetchInvoices
  };
};