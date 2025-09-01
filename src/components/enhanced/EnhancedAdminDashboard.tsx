import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  ShoppingCart,
  FileText,
  TrendingUp,
  Activity,
  Star,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

interface EnhancedStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalCoupons: number;
  totalOrganizations: number;
  totalCustomers: number;
  totalInvoices: number;
  totalPurchases: number;
  revenueGrowth: number;
}

interface SystemHealth {
  activeUsers24h: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'subscription' | 'invoice' | 'purchase';
  description: string;
  timestamp: string;
  userId?: string;
}

const EnhancedAdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [stats, setStats] = useState<EnhancedStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalCoupons: 0,
    totalOrganizations: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalPurchases: 0,
    revenueGrowth: 0
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    activeUsers24h: 0,
    errorRate: 0.5,
    responseTime: 120,
    uptime: 99.9
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchEnhancedDashboardData();
    }
  }, [isAdmin]);

  const fetchEnhancedDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive stats
      const [
        subscriptionsResult,
        organizationsResult,
        customersResult,
        invoicesResult,
        purchasesResult,
        couponsResult
      ] = await Promise.all([
        supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').order('created_at', { ascending: false }),
        supabase.from('organizations').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('purchases').select('*'),
        supabase.from('coupons').select('*')
      ]);

      const subscriptions = subscriptionsResult.data || [];
      const organizations = organizationsResult.data || [];
      const customers = customersResult.data || [];
      const invoices = invoicesResult.data || [];
      const purchases = purchasesResult.data || [];
      const coupons = couponsResult.data || [];

      // Calculate enhanced stats
      const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + (s.plan?.price_monthly || 0), 0);

      // Calculate revenue growth (mock data for now)
      const revenueGrowth = 12.5;

      setStats({
        totalUsers: subscriptions.length,
        activeSubscriptions: activeSubsCount,
        monthlyRevenue,
        totalCoupons: coupons.length,
        totalOrganizations: organizations.length,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalPurchases: purchases.length,
        revenueGrowth
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          type: 'subscription',
          description: 'User upgraded to Professional plan',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '3',
          type: 'invoice',
          description: 'Invoice INV-12345 created',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
          id: '4',
          type: 'purchase',
          description: 'New purchase recorded',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        }
      ]);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return <Users className="h-4 w-4" />;
      case 'subscription': return <Star className="h-4 w-4" />;
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'purchase': return <ShoppingCart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return 'text-green-500';
      case 'subscription': return 'text-yellow-500';
      case 'invoice': return 'text-blue-500';
      case 'purchase': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Admin Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive business management and analytics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-500">+12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${stats.monthlyRevenue}</p>
                <p className="text-xs text-green-500">+{stats.revenueGrowth}% growth</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-xs text-blue-500">{stats.totalUsers - stats.activeSubscriptions} trial users</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Organizations</p>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
                <p className="text-xs text-purple-500">{stats.totalCustomers} customers</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-xl font-bold">{stats.totalInvoices}</p>
              </div>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="text-xl font-bold">{stats.totalPurchases}</p>
              </div>
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Coupons</p>
                <p className="text-xl font-bold">{stats.totalCoupons}</p>
              </div>
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-xl font-bold text-green-500">{systemHealth.uptime}%</p>
              </div>
              <Activity className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="text-green-500">{systemHealth.uptime}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${systemHealth.uptime}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                  <span>{systemHealth.responseTime}ms</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: '75%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Error Rate</span>
                  <span className="text-yellow-500">{systemHealth.errorRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${systemHealth.errorRate * 20}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Active Users (24h)</p>
                <p className="text-2xl font-bold">{systemHealth.activeUsers24h}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Subscription management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Organization management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Enhanced coupon management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminDashboard;