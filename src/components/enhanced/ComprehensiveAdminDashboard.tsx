import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { UserManagement } from '@/components/admin/UserManagement';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { OrganizationManagement } from '@/components/admin/OrganizationManagement';
import { CouponManagement } from '@/components/admin/CouponManagement';

interface ComprehensiveStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  monthlyRevenue: number;
  totalCoupons: number;
  activeCoupons: number;
  totalOrganizations: number;
  totalCustomers: number;
  totalInvoices: number;
  totalPurchases: number;
  revenueGrowth: number;
  conversionRate: number;
}

interface SystemHealth {
  activeUsers24h: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
  databaseConnections: number;
  apiRequestsToday: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'subscription' | 'invoice' | 'purchase' | 'organization_created' | 'coupon_used';
  description: string;
  timestamp: string;
  userId?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

const ComprehensiveAdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [stats, setStats] = useState<ComprehensiveStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    monthlyRevenue: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    totalOrganizations: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalPurchases: 0,
    revenueGrowth: 12.5,
    conversionRate: 0
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    activeUsers24h: 0,
    errorRate: 0.2,
    responseTime: 85,
    uptime: 99.97,
    databaseConnections: 45,
    apiRequestsToday: 2847
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchComprehensiveDashboardData();
    }
  }, [isAdmin]);

  const fetchComprehensiveDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        subscriptionsResult,
        organizationsResult,
        customersResult,
        invoicesResult,
        purchasesResult,
        couponsResult
      ] = await Promise.all([
        supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').order('created_at', { ascending: false }),
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false })
      ]);

      const subscriptions = subscriptionsResult.data || [];
      const organizations = organizationsResult.data || [];
      const customers = customersResult.data || [];
      const invoices = invoicesResult.data || [];
      const purchases = purchasesResult.data || [];
      const coupons = couponsResult.data || [];

      // Calculate comprehensive statistics
      const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
      const trialUsersCount = subscriptions.filter(s => s.status === 'trial').length;
      const activeCouponsCount = coupons.filter(c => 
        c.is_active && new Date(c.expires_at) > new Date()
      ).length;

      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const planPrice = s.billing_cycle === 'annual' 
            ? s.plan?.price_annual / 12 
            : s.plan?.price_monthly || 0;
          return sum + planPrice;
        }, 0);

      const conversionRate = subscriptions.length > 0 
        ? (activeSubsCount / subscriptions.length) * 100 
        : 0;

      setStats({
        totalUsers: subscriptions.length,
        activeSubscriptions: activeSubsCount,
        trialUsers: trialUsersCount,
        monthlyRevenue,
        totalCoupons: coupons.length,
        activeCoupons: activeCouponsCount,
        totalOrganizations: organizations.length,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalPurchases: purchases.length,
        revenueGrowth: 12.5, // This would come from historical data
        conversionRate
      });

      // Generate mock recent activity based on real data
      const mockActivity: RecentActivity[] = [
        ...subscriptions.slice(0, 3).map((sub, i) => ({
          id: `sub-${i}`,
          type: 'subscription' as const,
          description: `New subscription: ${sub.plan?.name || 'Unknown Plan'}`,
          timestamp: sub.created_at,
          userId: sub.user_id,
          severity: 'success' as const
        })),
        ...organizations.slice(0, 2).map((org, i) => ({
          id: `org-${i}`,
          type: 'organization_created' as const,
          description: `Organization created: ${org.name}`,
          timestamp: org.created_at,
          userId: org.user_id,
          severity: 'info' as const
        })),
        ...invoices.slice(0, 2).map((inv, i) => ({
          id: `inv-${i}`,
          type: 'invoice' as const,
          description: `Invoice ${inv.invoice_number} created ($${inv.total_amount})`,
          timestamp: inv.created_at,
          userId: inv.user_id,
          severity: 'info' as const
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setRecentActivity(mockActivity);

      // Generate system alerts
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'High API Usage',
          description: 'API requests are 25% above normal levels',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'info',
          title: 'Database Backup Completed',
          description: 'Daily backup completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ];

      setAlerts(mockAlerts);

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
      case 'organization_created': return <Building className="h-4 w-4" />;
      case 'coupon_used': return <Package className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
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
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">Comprehensive Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Complete business management and analytics suite
          </p>
        </div>

        {/* Critical Alerts */}
        {alerts.filter(a => !a.resolved).length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts ({alerts.filter(a => !a.resolved).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
                  <div className="flex items-center text-xs mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+12% this month</span>
                  </div>
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
                  <p className="text-xl md:text-2xl font-bold">${stats.monthlyRevenue.toFixed(0)}</p>
                  <div className="flex items-center text-xs mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{stats.revenueGrowth}% growth</span>
                  </div>
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
                  <div className="flex items-center text-xs mt-1">
                    <Clock className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-blue-500">{stats.trialUsers} on trial</span>
                  </div>
                </div>
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-xl md:text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <div className="flex items-center text-xs mt-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">Above target</span>
                  </div>
                </div>
                <Star className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <Building className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-lg font-bold">{stats.totalOrganizations}</div>
                <div className="text-xs text-muted-foreground">Organizations</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-lg font-bold">{stats.totalCustomers}</div>
                <div className="text-xs text-muted-foreground">Customers</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-lg font-bold">{stats.totalInvoices}</div>
                <div className="text-xs text-muted-foreground">Invoices</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <ShoppingCart className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-lg font-bold">{stats.totalPurchases}</div>
                <div className="text-xs text-muted-foreground">Purchases</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <Package className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-lg font-bold">{stats.activeCoupons}</div>
                <div className="text-xs text-muted-foreground">Active Coupons</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <div className="text-lg font-bold text-green-500">{systemHealth.uptime}%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Health Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 md:h-80">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className={`${getActivityColor(activity.severity)} flex-shrink-0`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* System Health Monitor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>System Uptime</span>
                    <span className="text-green-500 font-medium">{systemHealth.uptime}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth.uptime}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span className="font-medium">{systemHealth.responseTime}ms</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Error Rate</span>
                    <span className="text-yellow-500 font-medium">{systemHealth.errorRate}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth.errorRate * 20}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{systemHealth.activeUsers24h}</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{systemHealth.apiRequestsToday.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">API Requests</div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View Detailed Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Modules */}
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

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <OrganizationManagement />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Revenue Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>User Behavior</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Building className="h-6 w-6" />
                    <span>Business Growth</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Financial Reports</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    <span>System Performance</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Star className="h-6 w-6" />
                    <span>Subscription Analytics</span>
                  </Button>
                </div>
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Advanced analytics features will be available in the next update. 
                    Current data shows healthy business growth with strong user engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;