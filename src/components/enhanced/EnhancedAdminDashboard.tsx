import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  DollarSign, 
  Calendar, 
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
import { UserManagement } from '@/components/admin/UserManagement';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { OrganizationManagement } from '@/components/admin/OrganizationManagement';
import { CouponManagement } from '@/components/admin/CouponManagement';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">Enhanced Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Comprehensive business management and analytics</p>
        </div>

        {/* Key Metrics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-green-500">+12% from last month</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl md:text-2xl font-bold">${stats.monthlyRevenue}</p>
                  <p className="text-xs text-green-500">+{stats.revenueGrowth}% growth</p>
                </div>
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.activeSubscriptions}</p>
                  <p className="text-xs text-blue-500">{stats.totalUsers - stats.activeSubscriptions} trial users</p>
                </div>
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Organizations</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.totalOrganizations}</p>
                  <p className="text-xs text-purple-500">{stats.totalCustomers} customers</p>
                </div>
                <Building className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Invoices</p>
                  <p className="text-lg sm:text-xl font-bold">{stats.totalInvoices}</p>
                </div>
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mt-2 sm:mt-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Purchases</p>
                  <p className="text-lg sm:text-xl font-bold">{stats.totalPurchases}</p>
                </div>
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mt-2 sm:mt-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Coupons</p>
                  <p className="text-lg sm:text-xl font-bold">{stats.totalCoupons}</p>
                </div>
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mt-2 sm:mt-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">System Health</p>
                  <p className="text-lg sm:text-xl font-bold text-green-500">{systemHealth.uptime}%</p>
                </div>
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-2 sm:mt-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Health - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 md:h-64">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 md:p-3 rounded-lg border">
                        <div className={`${getActivityColor(activity.type)} flex-shrink-0`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.description}</p>
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
                <CardTitle className="text-lg md:text-xl">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="text-green-500">{systemHealth.uptime}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
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
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
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
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth.errorRate * 20}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Active Users (24h)</p>
                  <p className="text-xl md:text-2xl font-bold">{systemHealth.activeUsers24h}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Tabs - Responsive */}
        <Tabs defaultValue="users" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] md:min-w-0">
              <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-xs sm:text-sm">Subscriptions</TabsTrigger>
              <TabsTrigger value="organizations" className="text-xs sm:text-sm">Organizations</TabsTrigger>
              <TabsTrigger value="coupons" className="text-xs sm:text-sm">Coupons</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="organizations">
            <OrganizationManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManagement />
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
    </div>
  );
};

export default EnhancedAdminDashboard;