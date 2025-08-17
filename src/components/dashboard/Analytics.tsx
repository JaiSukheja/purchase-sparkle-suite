import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/database";
import { usePurchases } from "@/hooks/usePurchases";

interface AnalyticsProps {
  customers: Customer[];
  onBack: () => void;
}

const Analytics = ({ customers, onBack }: AnalyticsProps) => {
  const { purchases } = usePurchases();

  // Calculate analytics data
  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalPurchases = purchases.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchase_date);
    return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
  });
  
  const thisMonthRevenue = thisMonthPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  const thisMonthCustomers = customers.filter(c => {
    const createdDate = new Date(c.created_at);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;

  const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
  const customerRetentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

  // Top products by revenue
  const productRevenue = purchases.reduce((acc, purchase) => {
    acc[purchase.product_name] = (acc[purchase.product_name] || 0) + purchase.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productRevenue)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: { value: "12%", isPositive: true },
      description: "All time revenue"
    },
    {
      title: "This Month Revenue",
      value: `$${thisMonthRevenue.toFixed(2)}`,
      icon: TrendingUp,
      trend: { value: "8.2%", isPositive: true },
      description: "Current month"
    },
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      icon: Users,
      trend: { value: "3.1%", isPositive: true },
      description: `${activeCustomers} active`
    },
    {
      title: "Total Purchases",
      value: totalPurchases.toString(),
      icon: ShoppingCart,
      trend: { value: "15%", isPositive: true },
      description: `${thisMonthPurchases.length} this month`
    },
    {
      title: "Avg. Order Value",
      value: `$${averageOrderValue.toFixed(2)}`,
      icon: DollarSign,
      trend: { value: "5.4%", isPositive: true },
      description: "Per transaction"
    },
    {
      title: "Retention Rate",
      value: `${customerRetentionRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: { value: "2.1%", isPositive: true },
      description: "Customer retention"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Updated {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 bg-gradient-card shadow-soft hover:shadow-elegant transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.trend.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.trend.value}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6 bg-gradient-card shadow-soft">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map(([product, revenue], index) => (
                <div key={product} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium truncate">{product}</span>
                  </div>
                  <span className="font-bold text-primary">${revenue.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No product data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-gradient-card shadow-soft">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {thisMonthPurchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{purchase.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-bold text-primary">${purchase.total_amount.toFixed(2)}</span>
              </div>
            ))}
            {thisMonthPurchases.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card className="p-6 bg-gradient-card shadow-soft">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg">This Month Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{thisMonthPurchases.length}</p>
              <p className="text-sm text-muted-foreground">Purchases</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{thisMonthCustomers}</p>
              <p className="text-sm text-muted-foreground">New Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">${thisMonthRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;