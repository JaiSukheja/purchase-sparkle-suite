import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomerList from "@/components/customers/CustomerList";
import Dashboard from "@/components/dashboard/Dashboard";
import Sidebar from "@/components/layout/Sidebar";
import CustomerForm from "@/components/forms/CustomerForm";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/hooks/useAuth";
import { Customer } from "@/types/database";
import { LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { customers, createCustomer, updateCustomer, loading } = useCustomers();
  const [activeView, setActiveView] = useState<'dashboard' | 'customers'>('dashboard');
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
    
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, customerData);
    } else {
      await createCustomer(customerData);
    }
    
    setFormLoading(false);
    setShowEditDialog(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 p-4 lg:p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Client Manager</h1>
              <Button variant="outline" onClick={() => signOut()}>
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
          </div>
        </main>
      </div>

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
