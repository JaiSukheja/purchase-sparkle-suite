import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Customer, Purchase, Invoice } from '@/types/database';
import { DollarSign, Users, ShoppingCart, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface ReportsOverviewProps {
  customers: Customer[];
  purchases: Purchase[];
  invoices: Invoice[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const ReportsOverview = ({ customers, purchases, invoices }: ReportsOverviewProps) => {
  const stats = useMemo(() => {
    const totalRevenue = purchases.reduce((sum, p) => sum + p.total_amount, 0);
    const totalCustomers = customers.length;
    const totalPurchases = purchases.length;
    const totalInvoices = invoices.length;
    
    const currentMonth = new Date().getMonth();
    const currentMonthPurchases = purchases.filter(p => 
      new Date(p.purchase_date).getMonth() === currentMonth
    );
    const lastMonthPurchases = purchases.filter(p => 
      new Date(p.purchase_date).getMonth() === currentMonth - 1
    );
    
    const currentMonthRevenue = currentMonthPurchases.reduce((sum, p) => sum + p.total_amount, 0);
    const lastMonthRevenue = lastMonthPurchases.reduce((sum, p) => sum + p.total_amount, 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalCustomers,
      totalPurchases,
      totalInvoices,
      revenueGrowth,
      currentMonthRevenue,
      averageOrderValue: totalPurchases > 0 ? totalRevenue / totalPurchases : 0
    };
  }, [customers, purchases, invoices]);

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = new Array(12).fill(0).map((_, index) => ({
      month: monthNames[index],
      revenue: 0,
      purchases: 0
    }));

    purchases.forEach(purchase => {
      const month = new Date(purchase.purchase_date).getMonth();
      monthlyStats[month].revenue += purchase.total_amount;
      monthlyStats[month].purchases += 1;
    });

    return monthlyStats.filter(stat => stat.revenue > 0 || stat.purchases > 0);
  }, [purchases]);

  const topProducts = useMemo(() => {
    const productStats = purchases.reduce((acc, purchase) => {
      const product = purchase.product_name;
      if (!acc[product]) {
        acc[product] = { name: product, quantity: 0, revenue: 0 };
      }
      acc[product].quantity += purchase.quantity;
      acc[product].revenue += purchase.total_amount;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [purchases]);

  const customerStats = useMemo(() => {
    return customers.map(customer => {
      const customerPurchases = purchases.filter(p => p.customer_id === customer.id);
      const totalSpent = customerPurchases.reduce((sum, p) => sum + p.total_amount, 0);
      return {
        name: customer.name,
        email: customer.email,
        totalSpent,
        purchaseCount: customerPurchases.length
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
  }, [customers, purchases]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(stats.revenueGrowth).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${stats.averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'paid').length} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue and purchase trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Customers by total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerStats.map((customer, index) => (
                  <div key={customer.email} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${customer.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{customer.purchaseCount} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};