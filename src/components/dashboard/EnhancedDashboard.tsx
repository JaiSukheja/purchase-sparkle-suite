import { Users, DollarSign, ShoppingCart, TrendingUp, Calendar, Activity, BarChart3, Plus, Search, Filter, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/database";
import { useState, useMemo } from "react";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";

interface EnhancedDashboardProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer?: () => void;
  onAddPurchase?: () => void;
  onAddInvoice?: () => void;
}

const EnhancedDashboard = ({ 
  customers, 
  onEditCustomer, 
  onViewCustomer, 
  onAddCustomer, 
  onAddPurchase, 
  onAddInvoice 
}: EnhancedDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { purchases } = usePurchases();
  const { invoices } = useInvoices();

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const thisMonthCustomers = customers.filter(c => 
      new Date(c.created_at).getMonth() === new Date().getMonth()
    ).length;
    const recentSignups = customers.filter(c => 
      Date.now() - new Date(c.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    
    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const thisMonthRevenue = purchases
      .filter(p => new Date(p.purchase_date).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + Number(p.total_amount), 0);
    
    const draftInvoices = invoices.filter(i => i.status === 'draft').length;

    return {
      totalCustomers: customers.length,
      activeCustomers,
      thisMonthCustomers,
      recentSignups,
      totalRevenue,
      thisMonthRevenue,
      totalPurchases: purchases.length,
      draftInvoices
    };
  }, [customers, purchases, invoices]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentCustomers = filteredCustomers.slice(0, 5);
  const recentActivity = purchases
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: {
    title: string;
    value: string;
    icon: any;
    trend?: { value: string; isPositive: boolean };
    color?: "primary" | "secondary" | "accent" | "muted";
  }) => (
    <Card className="group hover:shadow-elegant transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={`text-sm font-medium flex items-center ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 text-${color}-foreground`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={onAddCustomer}
              className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-foreground/20 rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Add Customer</div>
                  <div className="text-sm opacity-90">Create new profile</div>
                </div>
              </div>
            </Button>
            <Button 
              onClick={onAddPurchase}
              variant="secondary"
              className="h-16 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-foreground/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">New Purchase</div>
                  <div className="text-sm opacity-70">Record transaction</div>
                </div>
              </div>
            </Button>
            <Button 
              onClick={onAddInvoice}
              variant="outline"
              className="h-16 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Create Invoice</div>
                  <div className="text-sm opacity-70">Generate bill</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers.toString()}
          icon={Users}
          trend={{ value: "+12%", isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Active Customers"
          value={metrics.activeCustomers.toString()}
          icon={Activity}
          trend={{ value: "+8.2%", isPositive: true }}
          color="secondary"
        />
        <StatCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: "+15.3%", isPositive: true }}
          color="accent"
        />
        <StatCard
          title="This Month"
          value={`$${metrics.thisMonthRevenue.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: "+23.1%", isPositive: true }}
          color="muted"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Customers */}
        <div className="lg:col-span-2">
          <Card className="shadow-elegant">
            <CardHeader className="border-b bg-gradient-secondary/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Customers</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Latest customer registrations</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No customers found</p>
                    <p className="text-sm text-muted-foreground">Add your first customer to get started</p>
                  </div>
                ) : (
                  recentCustomers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => onViewCustomer(customer)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-lg">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {customer.name}
                            </p>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {customer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                          {customer.company && (
                            <p className="text-xs text-muted-foreground truncate">{customer.company}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(customer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Analytics */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-elegant">
            <CardHeader className="bg-gradient-secondary/50">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{metrics.totalPurchases}</div>
                  <div className="text-xs text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent">{metrics.draftInvoices}</div>
                  <div className="text-xs text-muted-foreground">Draft Invoices</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Customers</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {((metrics.activeCustomers / metrics.totalCustomers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(metrics.activeCustomers / metrics.totalCustomers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Growing Steadily</p>
                  <p className="text-xs text-muted-foreground">+{metrics.recentSignups} new this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-elegant">
            <CardHeader className="bg-gradient-secondary/50">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((purchase) => (
                    <div key={purchase.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {purchase.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${Number(purchase.total_amount).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;