import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity,
  Plus,
  ArrowUpRight,
  Calendar,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Customer } from "@/types/database";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";

interface ModernDashboardProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer?: () => void;
  onAddPurchase?: () => void;
  onAddInvoice?: () => void;
}

const ModernDashboard = ({ 
  customers, 
  onViewCustomer, 
  onAddCustomer, 
  onAddPurchase, 
  onAddInvoice 
}: ModernDashboardProps) => {
  const { purchases } = usePurchases();
  const { invoices } = useInvoices();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const thisMonth = new Date().getMonth();
    const monthlyRevenue = purchases
      .filter(p => new Date(p.purchase_date).getMonth() === thisMonth)
      .reduce((sum, p) => sum + Number(p.total_amount), 0);
    const monthlyCustomers = customers.filter(c => 
      new Date(c.created_at).getMonth() === thisMonth
    ).length;

    return {
      totalRevenue,
      activeCustomers,
      monthlyRevenue,
      monthlyCustomers,
      totalOrders: purchases.length,
      pendingInvoices: invoices.filter(i => i.status === 'draft').length
    };
  }, [customers, purchases, invoices]);

  const recentCustomers = customers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentOrders = purchases
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={onAddCustomer}
            size="lg"
            className="h-16 justify-start"
          >
            <Plus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Add Customer</div>
              <div className="text-sm opacity-90">Create new customer profile</div>
            </div>
          </Button>
          <Button 
            onClick={onAddPurchase}
            variant="secondary"
            size="lg"
            className="h-16 justify-start"
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">New Order</div>
              <div className="text-sm opacity-70">Record a purchase</div>
            </div>
          </Button>
          <Button 
            onClick={onAddInvoice}
            variant="outline"
            size="lg"
            className="h-16 justify-start"
          >
            <DollarSign className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Create Invoice</div>
              <div className="text-sm opacity-70">Generate new invoice</div>
            </div>
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12.5% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">{metrics.activeCustomers}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{metrics.monthlyCustomers} this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: ${metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(2) : '0'} per order
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${metrics.monthlyRevenue.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Revenue growth
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Customers */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Customers</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No customers yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onAddCustomer}
                      className="mt-2"
                    >
                      Add Your First Customer
                    </Button>
                  </div>
                ) : (
                  recentCustomers.map((customer) => (
                    <div 
                      key={customer.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onViewCustomer(customer)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        ${Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Invoices</span>
                  <Badge variant="outline">{metrics.pendingInvoices}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer Growth</span>
                  <span className="text-sm font-medium text-green-600">
                    +{Math.round((metrics.monthlyCustomers / Math.max(customers.length - metrics.monthlyCustomers, 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  <span className="text-sm font-medium">
                    ${metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;