import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer: null,
  loading: true,
  login: async () => false,
  logout: () => {}
});

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored customer session
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('authenticate_customer', {
          p_email: email,
          p_password: password
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const customerData = {
          id: data[0].customer_id,
          name: data[0].customer_name,
          email: data[0].customer_email
        };
        
        setCustomer(customerData);
        localStorage.setItem('customer', JSON.stringify(customerData));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${customerData.name}!`
        });
        
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};