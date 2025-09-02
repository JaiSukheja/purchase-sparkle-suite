import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar, 
  Users, 
  CreditCard, 
  Clock, 
  Star,
  Filter,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  user_metadata?: any;
}

interface UserSubscription {
  id: string;
  user_id: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
  current_period_start: string;
  plan: {
    id: string;
    name: string;
    price_monthly: number;
    price_annual: number;
    max_organizations: number;
    max_customers_per_org: number;
  };
}

interface Organization {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  user_id: string;
  organization_id: string;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersResult, subsResult, orgsResult, customersResult] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)'),
        supabase.from('organizations').select('*'),
        supabase.from('customers').select('*')
      ]);

      if (usersResult.error) throw usersResult.error;
      
      setUsers(usersResult.data.users);
      setSubscriptions(subsResult.data || []);
      setOrganizations(orgsResult.data || []);
      setCustomers(customersResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(sub => sub.user_id === userId);
  };

  const getUserOrganizations = (userId: string) => {
    return organizations.filter(org => org.user_id === userId);
  };

  const getUserCustomers = (userId: string) => {
    const userOrgs = getUserOrganizations(userId);
    return customers.filter(customer => 
      userOrgs.some(org => org.id === customer.organization_id)
    );
  };

  const getUserCategory = (user: User) => {
    const subscription = getUserSubscription(user.id);
    if (!subscription) return 'no-plan';
    
    switch (subscription.status) {
      case 'active':
        return subscription.plan.name === 'Free' ? 'free' : 'paid';
      case 'trial':
        return 'trial';
      default:
        return 'inactive';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    if (filterStatus === 'all') return matchesSearch;
    
    const category = getUserCategory(user);
    switch (filterStatus) {
      case 'free':
        return matchesSearch && category === 'free';
      case 'paid':
        return matchesSearch && category === 'paid';
      case 'trial':
        return matchesSearch && category === 'trial';
      case 'inactive':
        return matchesSearch && category === 'inactive';
      case 'no-plan':
        return matchesSearch && category === 'no-plan';
      default:
        return matchesSearch;
    }
  });

  const getUserStats = (): UserStats => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = users.reduce((acc, user) => {
      const category = getUserCategory(user);
      const createdAt = new Date(user.created_at);
      
      acc.totalUsers++;
      
      switch (category) {
        case 'free':
          acc.freeUsers++;
          break;
        case 'paid':
          acc.paidUsers++;
          acc.activeUsers++;
          break;
        case 'trial':
          acc.trialUsers++;
          acc.activeUsers++;
          break;
      }
      
      if (createdAt >= startOfMonth) {
        acc.newUsersThisMonth++;
      }
      
      return acc;
    }, {
      totalUsers: 0,
      freeUsers: 0,
      paidUsers: 0,
      trialUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0
    });
    
    return stats;
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserSubscription = async (userId: string, newStatus: string) => {
    try {
      const userSubscription = getUserSubscription(userId);
      if (!userSubscription) {
        toast({
          title: "No subscription found",
          description: "This user doesn't have a subscription to update",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchData();
      setIsSheetOpen(false);
      toast({
        title: "Subscription updated",
        description: `User subscription status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: "Error updating subscription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCategoryBadge = (user: User) => {
    const category = getUserCategory(user);
    const subscription = getUserSubscription(user.id);
    
    switch (category) {
      case 'free':
        return <Badge variant="outline">Free Plan</Badge>;
      case 'paid':
        return <Badge variant="default">Paid Plan</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'no-plan':
        return <Badge variant="outline" className="text-muted-foreground">No Plan</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
              <div className="text-xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <CreditCard className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <div className="text-xl font-bold">{stats.paidUsers}</div>
              <div className="text-xs text-muted-foreground">Paid Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <div className="text-xl font-bold">{stats.trialUsers}</div>
              <div className="text-xs text-muted-foreground">Trial Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <Star className="h-6 w-6 mx-auto text-purple-500 mb-2" />
              <div className="text-xl font-bold">{stats.freeUsers}</div>
              <div className="text-xs text-muted-foreground">Free Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <div className="text-xl font-bold">{stats.activeUsers}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <UserPlus className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
              <div className="text-xl font-bold">{stats.newUsersThisMonth}</div>
              <div className="text-xs text-muted-foreground">New This Month</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User & Subscription Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage users, subscriptions, and customer relationships
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="paid">Paid Users</SelectItem>
              <SelectItem value="free">Free Users</SelectItem>
              <SelectItem value="trial">Trial Users</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="no-plan">No Plan</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">User</TableHead>
                  <TableHead className="hidden sm:table-cell">Subscription</TableHead>
                  <TableHead className="hidden md:table-cell">Business Data</TableHead>
                  <TableHead className="hidden lg:table-cell">Activity</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const subscription = getUserSubscription(user.id);
                  const userOrgs = getUserOrganizations(user.id);
                  const userCustomers = getUserCustomers(user.id);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium">{user.email || 'No email'}</div>
                          <div className="flex gap-2 flex-wrap">
                            {getCategoryBadge(user)}
                            {user.email_confirmed_at && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        {subscription ? (
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{subscription.plan.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {subscription.billing_cycle} • {subscription.status}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${subscription.plan.price_monthly}/month
                            </div>
                            {subscription.status === 'trial' && (
                              <div className="text-xs text-yellow-600">
                                Ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No subscription</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{userOrgs.length}</span> organizations
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{userCustomers.length}</span> customers
                          </div>
                          {subscription && (
                            <div className="text-xs text-muted-foreground">
                              Limits: {subscription.plan.max_organizations} orgs, {subscription.plan.max_customers_per_org} customers/org
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            Last login: {user.last_sign_in_at ? 
                              new Date(user.last_sign_in_at).toLocaleDateString() : 
                              'Never'
                            }
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-2xl">
                              <SheetHeader>
                                <SheetTitle>User Management</SheetTitle>
                              </SheetHeader>
                              {selectedUser && (
                                <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                                  <Tabs defaultValue="overview" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="overview">Overview</TabsTrigger>
                                      <TabsTrigger value="subscription">Subscription</TabsTrigger>
                                      <TabsTrigger value="business">Business</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="overview" className="space-y-4">
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Email</Label>
                                          <div className="text-sm mt-1">{selectedUser.email || 'No email'}</div>
                                        </div>
                                        
                                        <div>
                                          <Label>User ID</Label>
                                          <div className="text-sm mt-1 font-mono">{selectedUser.id}</div>
                                        </div>
                                        
                                        <div>
                                          <Label>Account Status</Label>
                                          <div className="mt-2">{getCategoryBadge(selectedUser)}</div>
                                        </div>
                                        
                                        <div>
                                          <Label>Registration</Label>
                                          <div className="text-sm mt-1">
                                            {new Date(selectedUser.created_at).toLocaleString()}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <Label>Last Sign In</Label>
                                          <div className="text-sm mt-1">
                                            {selectedUser.last_sign_in_at ? 
                                              new Date(selectedUser.last_sign_in_at).toLocaleString() : 
                                              'Never signed in'
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="subscription" className="space-y-4">
                                      {(() => {
                                        const userSub = getUserSubscription(selectedUser.id);
                                        return userSub ? (
                                          <div className="space-y-4">
                                            <div>
                                              <Label>Current Plan</Label>
                                              <div className="mt-2 p-3 border rounded-lg">
                                                <div className="font-medium">{userSub.plan.name}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                  ${userSub.plan.price_monthly}/month • {userSub.billing_cycle}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <Label>Status</Label>
                                              <div className="mt-2">
                                                <Badge variant={userSub.status === 'active' ? 'default' : 'secondary'}>
                                                  {userSub.status}
                                                </Badge>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <Label>Period</Label>
                                              <div className="text-sm mt-1">
                                                {new Date(userSub.current_period_start).toLocaleDateString()} - {new Date(userSub.current_period_end).toLocaleDateString()}
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <Label>Change Status</Label>
                                              <div className="flex gap-2 mt-2">
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  onClick={() => updateUserSubscription(selectedUser.id, 'active')}
                                                  disabled={userSub.status === 'active'}
                                                >
                                                  Activate
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  onClick={() => updateUserSubscription(selectedUser.id, 'cancelled')}
                                                  disabled={userSub.status === 'cancelled'}
                                                >
                                                  Cancel
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  onClick={() => updateUserSubscription(selectedUser.id, 'trial')}
                                                  disabled={userSub.status === 'trial'}
                                                >
                                                  Trial
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-center py-8">
                                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">No subscription found</p>
                                          </div>
                                        );
                                      })()}
                                    </TabsContent>
                                    
                                    <TabsContent value="business" className="space-y-4">
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Organizations ({getUserOrganizations(selectedUser.id).length})</Label>
                                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                            {getUserOrganizations(selectedUser.id).map(org => (
                                              <div key={org.id} className="p-2 border rounded text-sm">
                                                <div className="font-medium">{org.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  Created: {new Date(org.created_at).toLocaleDateString()}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <Label>Customers ({getUserCustomers(selectedUser.id).length})</Label>
                                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                            {getUserCustomers(selectedUser.id).map(customer => (
                                              <div key={customer.id} className="p-2 border rounded text-sm">
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">{customer.email}</div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </ScrollArea>
                              )}
                            </SheetContent>
                          </Sheet>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Revenue Users</div>
              <div>Paid subscribers: {stats.paidUsers}</div>
              <div>Trial conversions needed: {stats.trialUsers}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Free Tier</div>
              <div>Free plan users: {stats.freeUsers}</div>
              <div>Upgrade opportunities: {stats.freeUsers + stats.trialUsers}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Growth</div>
              <div>New users this month: {stats.newUsersThisMonth}</div>
              <div>Conversion rate: {stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};