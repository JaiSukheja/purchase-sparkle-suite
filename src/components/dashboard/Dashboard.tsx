import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import { mockStats, mockCustomers, mockPurchases } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import CustomerCard from "../customers/CustomerCard";
import { Customer } from "@/types/customer";

interface DashboardProps {
  onEditCustomer: (customer: Customer) => void;
  onAddPurchase: (customer: Customer) => void;
}

const Dashboard = ({ onEditCustomer, onAddPurchase }: DashboardProps) => {
  const recentCustomers = mockCustomers.slice(0, 3);
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
          value={mockStats.totalCustomers.toString()}
          icon={Users}
          trend={{ value: "12%", isPositive: true }}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${mockStats.averageOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: "3.1%", isPositive: false }}
        />
        <StatsCard
          title="Recent Purchases"
          value={mockStats.recentPurchases.toString()}
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
                  onAddPurchase={onAddPurchase}
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
              {recentPurchases.map((purchase) => {
                const customer = mockCustomers.find(c => c.id === purchase.customerId);
                return (
                  <div key={purchase.id} className="border-b border-border/50 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{purchase.productName}</p>
                        <p className="text-xs text-muted-foreground">{customer?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.date.toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">${purchase.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;