import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import CustomerList from "@/components/customers/CustomerList";
import { Customer } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleEditCustomer = (customer: Customer) => {
    toast({
      title: "Edit Customer",
      description: `Opening edit form for ${customer.name}`,
    });
  };

  const handleAddPurchase = (customer: Customer) => {
    toast({
      title: "Add Purchase",
      description: `Adding purchase for ${customer.name}`,
    });
  };

  const handleAddCustomer = () => {
    toast({
      title: "Add Customer",
      description: "Opening new customer form",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onEditCustomer={handleEditCustomer} onAddPurchase={handleAddPurchase} />;
      case 'customers':
        return (
          <CustomerList
            onEditCustomer={handleEditCustomer}
            onAddPurchase={handleAddPurchase}
            onAddCustomer={handleAddCustomer}
          />
        );
      case 'purchases':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Purchases</h1>
            <p className="text-muted-foreground">Purchase management coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </div>
        );
      default:
        return <Dashboard onEditCustomer={handleEditCustomer} onAddPurchase={handleAddPurchase} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
