import { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Grid3X3,
  Eye,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/database";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";

interface AnalyticsDashboardProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer?: () => void;
  onAddPurchase?: () => void;
  onAddInvoice?: () => void;
}

const AnalyticsDashboard = ({ 
  customers, 
  onViewCustomer, 
  onAddCustomer, 
  onAddPurchase, 
  onAddInvoice 
}: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { purchases } = usePurchases();
  const { invoices } = useInvoices();

  // Analytics data processing
  const analyticsData = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Revenue analytics
    const revenueData = purchases
      .filter(p => new Date(p.purchase_date) >= startDate)
      .reduce((acc, purchase) => {
        const date = new Date(purchase.purchase_date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + Number(purchase.total_amount);
        return acc;
      }, {} as Record<string, number>);

    const chartData = Object.entries(revenueData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, revenue]) => ({ date, revenue }));

    // Customer growth
    const customerGrowth = customers
      .filter(c => new Date(c.created_at) >= startDate)
      .reduce((acc, customer) => {
        const date = new Date(customer.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const growthData = Object.entries(customerGrowth)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, customers: count }));

    // Product performance
    const productData = purchases
      .filter(p => new Date(p.purchase_date) >= startDate)
      .reduce((acc, purchase) => {
        const product = purchase.product_name;
        acc[product] = (acc[product] || 0) + Number(purchase.total_amount);
        return acc;
      }, {} as Record<string, number>);

    const topProducts = Object.entries(productData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    // Status distribution
    const statusData = [
      { name: "Active", value: customers.filter(c => c.status === 'active').length, color: "#22c55e" },
      { name: "Inactive", value: customers.filter(c => c.status === 'inactive').length, color: "#ef4444" }
    ];

    return {
      chartData,
      growthData,
      topProducts,
      statusData,
      totalRevenue: purchases.reduce((sum, p) => sum + Number(p.total_amount), 0),
      avgOrderValue: purchases.length > 0 ? purchases.reduce((sum, p) => sum + Number(p.total_amount), 0) / purchases.length : 0,
      conversionRate: customers.length > 0 ? (purchases.length / customers.length) * 100 : 0
    };
  }, [customers, purchases, timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = "up",
    format = "number"
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    trend?: "up" | "down";
    format?: "number" | "currency" | "percentage";
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case "currency": return `$${val.toFixed(2)}`;
        case "percentage": return `${val.toFixed(1)}%`;
        default: return val.toFixed(0);
      }
    };

    return (
      <Card className="hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold text-foreground">{formatValue(value)}</p>
              <div className="flex items-center space-x-1">
                {trend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          change={23.5}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Customers"
          value={customers.length}
          change={12.3}
          icon={Users}
        />
        <MetricCard
          title="Avg Order Value"
          value={analyticsData.avgOrderValue}
          change={8.7}
          icon={Target}
          format="currency"
        />
        <MetricCard
          title="Conversion Rate"
          value={analyticsData.conversionRate}
          change={-2.1}
          icon={TrendingUp}
          trend="down"
          format="percentage"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-secondary" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.growthData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-accent" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Status */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-muted-foreground" />
              Customer Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {analyticsData.statusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium">{status.name}</span>
                    </div>
                    <Badge variant="secondary">{status.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-elegant bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Grid3X3 className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={onAddCustomer}
              className="h-20 flex-col space-y-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
            <Button 
              onClick={onAddPurchase}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <ShoppingBag className="h-6 w-6" />
              <span>New Purchase</span>
            </Button>
            <Button 
              onClick={onAddInvoice}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Stream */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.slice(0, 5).map((customer, index) => (
              <div 
                key={customer.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onViewCustomer(customer)}
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;