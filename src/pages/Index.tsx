import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomerList from "@/components/customers/CustomerList";
import Dashboard from "@/components/dashboard/Dashboard";
import PurchaseList from "@/components/dashboard/PurchaseList";
import Analytics from "@/components/dashboard/Analytics";
import Sidebar from "@/components/layout/Sidebar";
import CustomerForm from "@/components/forms/CustomerForm";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/hooks/useAuth";
import { Customer } from "@/types/database";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { customers, createCustomer, updateCustomer, loading } = useCustomers();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'dashboard' | 'customers' | 'purchases' | 'analytics'>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditDialog(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}`);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowEditDialog(true);
  };

  const handleCustomerSubmit = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, customerData);
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await createCustomer(customerData);
        toast({
          title: "Success", 
          description: "Customer created successfully",
        });
      }
      
      setShowEditDialog(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Welcome back!</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage your customers and grow your business</p>
            </div>
            <Button variant="outline" onClick={() => signOut()} size="sm" className="self-end sm:self-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          {activeView === 'dashboard' && (
            <Dashboard 
              customers={customers}
              onEditCustomer={handleEditCustomer}
              onViewCustomer={handleViewCustomer}
            />
          )}
          
          {activeView === 'customers' && (
            <CustomerList 
              customers={customers}
              onEditCustomer={handleEditCustomer}
              onViewCustomer={handleViewCustomer}
              onAddCustomer={handleAddCustomer}
              loading={loading}
            />
          )}
          
          {activeView === 'purchases' && (
            <PurchaseList onBack={() => setActiveView('dashboard')} />
          )}
          
          {activeView === 'analytics' && (
            <Analytics 
              customers={customers} 
              onBack={() => setActiveView('dashboard')} 
            />
          )}
        </div>
      </main>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSubmit={handleCustomerSubmit}
            onCancel={() => setShowEditDialog(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
