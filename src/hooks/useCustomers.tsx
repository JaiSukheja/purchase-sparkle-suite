import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/database';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setCustomers((data || []) as Customer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customerData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating customer",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setCustomers(prev => [data as Customer, ...prev]);
    toast({
      title: "Customer created",
      description: "Customer has been created successfully."
    });
    return data;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating customer",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    setCustomers(prev => prev.map(c => c.id === id ? (data as Customer) : c));
    toast({
      title: "Customer updated",
      description: "Customer has been updated successfully."
    });
    return data;
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error deleting customer",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Customer deleted",
      description: "Customer has been deleted successfully."
    });
    return true;
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};