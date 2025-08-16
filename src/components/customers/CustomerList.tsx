import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CustomerCard from "./CustomerCard";
import { mockCustomers } from "@/data/mockData";
import { Customer } from "@/types/customer";

interface CustomerListProps {
  onEditCustomer: (customer: Customer) => void;
  onAddPurchase: (customer: Customer) => void;
  onAddCustomer: () => void;
}

const CustomerList = ({ onEditCustomer, onAddPurchase, onAddCustomer }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button onClick={onAddCustomer} className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gradient-card shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>
      </Card>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={onEditCustomer}
            onAddPurchase={onAddPurchase}
          />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center bg-gradient-card shadow-soft">
          <p className="text-muted-foreground text-lg">No customers found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters, or add a new customer.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CustomerList;