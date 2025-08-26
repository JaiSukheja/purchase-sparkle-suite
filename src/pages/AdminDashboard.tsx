import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, DollarSign, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
  plan: {
    name: string;
    price_monthly: number;
  };
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalCoupons: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_uses: 100,
    expires_at: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          status,
          billing_cycle,
          current_period_end,
          plan:subscription_plans(name, price_monthly)
        `)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch coupons
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (couponsError) throw couponsError;

      setSubscriptions(subsData || []);
      setCoupons(couponsData || []);

      // Calculate stats
      const activeSubsCount = subsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subsData
        ?.filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + (s.plan?.price_monthly || 0), 0) || 0;

      setStats({
        totalUsers: subsData?.length || 0,
        activeSubscriptions: activeSubsCount,
        monthlyRevenue,
        totalCoupons: couponsData?.length || 0
      });
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

  const createCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: newCoupon.code.toUpperCase(),
          discount_type: newCoupon.discount_type,
          discount_value: newCoupon.discount_value,
          max_uses: newCoupon.max_uses,
          expires_at: newCoupon.expires_at || null
        });

      if (error) throw error;

      toast({
        title: "Coupon created",
        description: `Coupon ${newCoupon.code} has been created successfully.`
      });

      setShowCreateCoupon(false);
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: 100,
        expires_at: ''
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error creating coupon",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !isActive })
        .eq('id', couponId);

      if (error) throw error;

      toast({
        title: "Coupon updated",
        description: `Coupon has been ${!isActive ? 'activated' : 'deactivated'}.`
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error updating coupon",
        description: error.message,
        variant: "destructive"
      });
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage subscriptions, coupons, and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${stats.monthlyRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Coupons</p>
                  <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                </div>
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>User Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{subscription.user_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.plan?.name} - {subscription.billing_cycle}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expires: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Coupons</CardTitle>
                <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                          id="code"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="SAVE20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount_type">Discount Type</Label>
                        <Select 
                          value={newCoupon.discount_type} 
                          onValueChange={(value) => setNewCoupon(prev => ({ ...prev, discount_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="discount_value">Discount Value</Label>
                        <Input
                          id="discount_value"
                          type="number"
                          value={newCoupon.discount_value}
                          onChange={(e) => setNewCoupon(prev => ({ ...prev, discount_value: parseFloat(e.target.value) }))}
                          placeholder={newCoupon.discount_type === 'percentage' ? '20' : '10.00'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_uses">Max Uses</Label>
                        <Input
                          id="max_uses"
                          type="number"
                          value={newCoupon.max_uses}
                          onChange={(e) => setNewCoupon(prev => ({ ...prev, max_uses: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                        <Input
                          id="expires_at"
                          type="date"
                          value={newCoupon.expires_at}
                          onChange={(e) => setNewCoupon(prev => ({ ...prev, expires_at: e.target.value }))}
                        />
                      </div>
                      <Button onClick={createCoupon} className="w-full">
                        Create Coupon
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{coupon.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} off
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Used: {coupon.current_uses}/{coupon.max_uses}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        >
                          {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;