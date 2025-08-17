import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import { mockStats, mockCustomers, mockPurchases } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import CustomerCard from "../customers/CustomerCard";
import { Customer } from "@/types/database";

interface DashboardProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
}

const Dashboard = ({ customers, onEditCustomer, onViewCustomer }: DashboardProps) => {
  const recentCustomers = customers.slice(0, 3);
  const recentPurchases = mockPurchases
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={customers.length.toString()}
          icon={Users}
          trend={{ value: "12%", isPositive: true }}
        />
        <StatsCard
          title="Active Customers"
          value={customers.filter(c => c.status === 'active').length.toString()}
          icon={DollarSign}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <StatsCard
          title="This Month"
          value={customers.filter(c => 
            new Date(c.created_at).getMonth() === new Date().getMonth()
          ).length.toString()}
          icon={TrendingUp}
          trend={{ value: "3.1%", isPositive: true }}
        />
        <StatsCard
          title="Recent Signups"
          value={customers.filter(c => 
            Date.now() - new Date(c.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length.toString()}
          icon={ShoppingCart}
          trend={{ value: "15%", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-gradient-card shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Recent Customers</h2>
            <div className="grid gap-4">
              {recentCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={onEditCustomer}
                  onAddPurchase={() => onViewCustomer(customer)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Purchases */}
        <div>
          <Card className="p-6 bg-gradient-card shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
            <div className="space-y-4">
              {customers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No customers yet</p>
              ) : (
                customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="border-b border-border/50 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;