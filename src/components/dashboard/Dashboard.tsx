import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import { mockStats, mockCustomers, mockPurchases } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerCard from "../customers/CustomerCard";
import { Customer } from "@/types/database";
import { useState } from "react";

interface DashboardProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer?: () => void;
  onAddPurchase?: () => void;
  onAddInvoice?: () => void;
}

const Dashboard = ({ customers, onEditCustomer, onViewCustomer, onAddCustomer, onAddPurchase, onAddInvoice }: DashboardProps) => {
  const recentCustomers = customers.slice(0, 3);
  const recentPurchases = mockPurchases
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-card rounded-2xl p-8 border overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground text-lg">Here's your business overview and latest insights</p>
        </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="group hover:shadow-sm transition-all duration-300 cursor-pointer"
          onClick={onAddCustomer}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Add Customer</h3>
            <p className="text-sm text-muted-foreground">Create new customer profile</p>
          </CardContent>
        </Card>

        <Card 
          className="group hover:shadow-sm transition-all duration-300 cursor-pointer"
          onClick={onAddPurchase}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <ShoppingCart className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">New Purchase</h3>
            <p className="text-sm text-muted-foreground">Record customer purchase</p>
          </CardContent>
        </Card>

        <Card 
          className="group hover:shadow-sm transition-all duration-300 cursor-pointer"
          onClick={onAddInvoice}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <DollarSign className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Create Invoice</h3>
            <p className="text-sm text-muted-foreground">Generate new invoice</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Customers */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-foreground">Recent Customers</h2>
              <p className="text-sm text-muted-foreground mt-1">Latest customer registrations</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No customers yet</p>
                    <p className="text-sm text-muted-foreground">Add your first customer to get started</p>
                  </div>
                ) : (
                  recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                         onClick={() => onViewCustomer(customer)}>
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold">{customer.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {customer.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Summary */}
        <div>
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Activity Summary</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Recent business activity</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{customers.length}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Customers</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Active</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {customers.filter(c => c.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">This Month</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {customers.filter(c => 
                      new Date(c.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">This Week</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {customers.filter(c => 
                      Date.now() - new Date(c.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">Business Growing</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Keep up the great work!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;