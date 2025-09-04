import { useNavigate } from "react-router-dom";
import EnhancedDashboard from "@/components/dashboard/EnhancedDashboard";
import { useCustomers } from "@/hooks/useCustomers";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerForm from "@/components/forms/CustomerForm";
import { Customer } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { customers, createCustomer, updateCustomer } = useCustomers();
  const { toast } = useToast();
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
    <div className="min-h-screen bg-background">
      <EnhancedDashboard 
        customers={customers}
        onEditCustomer={handleEditCustomer}
        onViewCustomer={handleViewCustomer}
        onAddCustomer={handleAddCustomer}
        onAddPurchase={() => navigate('/app/purchases')}
        onAddInvoice={() => navigate('/app/invoices')}
      />

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

export default DashboardPage;