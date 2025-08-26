import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Purchase } from '@/types/database';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useOrganizationContext } from './useOrganizationContext';

export const usePurchases = (customerId?: string) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedOrganizationId } = useOrganizationContext();

  const fetchPurchases = async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id);

    if (selectedOrganizationId) {
      query = query.eq('organization_id', selectedOrganizationId);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query.order('purchase_date', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching purchases",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPurchases((data || []) as Purchase[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchases();
  }, [user, customerId, selectedOrganizationId]);

  const createPurchase = async (purchaseData: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !selectedOrganizationId) return null;

    const { data, error } = await supabase
      .from('purchases')
      .insert([{ ...purchaseData, user_id: user.id, organization_id: selectedOrganizationId }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating purchase",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setPurchases(prev => [data as Purchase, ...prev]);
    toast({
      title: "Purchase created",
      description: "Purchase has been created successfully."
    });
    return data;
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>) => {
    const { data, error } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating purchase",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setPurchases(prev => prev.map(p => p.id === id ? (data as Purchase) : p));
    toast({
      title: "Purchase updated",
      description: "Purchase has been updated successfully."
    });
    return data;
  };

  const deletePurchase = async (id: string) => {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error deleting purchase",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    setPurchases(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Purchase deleted",
      description: "Purchase has been deleted successfully."
    });
    return true;
  };

  return {
    purchases,
    loading,
    createPurchase,
    updatePurchase,
    deletePurchase,
    refetch: fetchPurchases
  };
};