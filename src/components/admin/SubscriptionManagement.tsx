import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  plan: {
    id: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_annual: number;
    max_organizations: number;
    max_customers_per_org: number;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  description: string;
  is_active: boolean;
  max_organizations: number;
  max_customers_per_org: number;
}

export const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [subsResult, plansResult] = await Promise.all([
        supabase.from('user_subscriptions').select(`
          *,
          plan:subscription_plans(*)
        `).order('created_at', { ascending: false }),
        supabase.from('subscription_plans').select('*').order('price_monthly')
      ]);

      if (subsResult.error) throw subsResult.error;
      if (plansResult.error) throw plansResult.error;
      
      setSubscriptions(subsResult.data || []);
      setPlans(plansResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading subscription data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;

      await fetchData();
      setIsSheetOpen(false);
      toast({
        title: "Subscription updated",
        description: `Status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: "Error updating subscription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'past_due': return 'outline';
      default: return 'outline';
    }
  };

  const calculateRevenue = () => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const monthlyRevenue = sub.billing_cycle === 'annual' 
          ? sub.plan.price_annual / 12 
          : sub.plan.price_monthly;
        return total + monthlyRevenue;
      }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading subscriptions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${calculateRevenue().toFixed(2)}</p>
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
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trial Users</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'trial').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {subscriptions.length > 0 
                    ? ((subscriptions.filter(s => s.status === 'active').length / subscriptions.length) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-sm text-muted-foreground">Manage user subscriptions and billing</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">User ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Billing</TableHead>
                  <TableHead className="hidden lg:table-cell">Period End</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-mono text-xs">
                      {subscription.user_id.slice(0, 8)}...
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{subscription.plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${subscription.billing_cycle === 'annual' 
                            ? subscription.plan.price_annual 
                            : subscription.plan.price_monthly
                          }/{subscription.billing_cycle === 'annual' ? 'year' : 'month'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {subscription.billing_cycle}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubscription(subscription)}
                          >
                            Edit
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Subscription Details</SheetTitle>
                          </SheetHeader>
                          {selectedSubscription && (
                            <div className="space-y-6 mt-6">
                              <div className="space-y-4">
                                <div>
                                  <Label>User ID</Label>
                                  <div className="text-sm text-muted-foreground mt-1 font-mono">
                                    {selectedSubscription.user_id}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Plan</Label>
                                  <div className="mt-2 p-3 border rounded-lg">
                                    <div className="font-medium">{selectedSubscription.plan.name}</div>
                                     {selectedSubscription.plan.description && (
                                       <div className="text-sm text-muted-foreground mt-1">
                                         {selectedSubscription.plan.description}
                                       </div>
                                     )}
                                    <div className="flex gap-4 mt-2 text-sm">
                                      <div>Monthly: ${selectedSubscription.plan.price_monthly}</div>
                                      <div>Annual: ${selectedSubscription.plan.price_annual}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Current Status</Label>
                                  <div className="mt-2">
                                    <Badge variant={getStatusColor(selectedSubscription.status)}>
                                      {selectedSubscription.status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Update Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="trial">Trial</SelectItem>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="past_due">Past Due</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Period Start</Label>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {new Date(selectedSubscription.current_period_start).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Period End</Label>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {new Date(selectedSubscription.current_period_end).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => updateSubscriptionStatus(selectedSubscription.id, newStatus)}
                                disabled={!newStatus || newStatus === selectedSubscription.status}
                                className="w-full"
                              >
                                Update Status
                              </Button>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};