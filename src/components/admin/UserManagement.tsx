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
import { Search, UserPlus, Edit, Trash2, Mail, Calendar } from 'lucide-react';
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
  plan: {
    name: string;
    price_monthly: number;
  };
}

interface Organization {
  id: string;
  name: string;
  user_id: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersResult, subsResult, orgsResult] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase.from('user_subscriptions').select('*, plan:subscription_plans(name, price_monthly)'),
        supabase.from('organizations').select('*')
      ]);

      if (usersResult.error) throw usersResult.error;
      
      setUsers(usersResult.data.users);
      setSubscriptions(subsResult.data || []);
      setOrganizations(orgsResult.data || []);
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

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage system users and their subscriptions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Subscription</TableHead>
                  <TableHead className="hidden md:table-cell">Organizations</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Sign In</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const subscription = getUserSubscription(user.id);
                  const userOrgs = getUserOrganizations(user.id);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.email || 'No email'}</div>
                          <div className="flex gap-2">
                            {user.email_confirmed_at && (
                              <Badge variant="secondary" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        {subscription ? (
                          <Badge 
                            variant={subscription.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {subscription.plan.name} ({subscription.status})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">No Plan</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          {userOrgs.length > 0 ? (
                            userOrgs.map(org => (
                              <div key={org.id} className="text-sm">{org.name}</div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No organizations</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        {user.last_sign_in_at ? (
                          <div className="text-sm">
                            {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
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
                                <Edit className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                              </SheetHeader>
                              {selectedUser && (
                                <div className="space-y-4 mt-6">
                                <div>
                                  <Label>Email</Label>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {selectedUser.email || 'No email'}
                                  </div>
                                </div>
                                  
                                  <div>
                                    <Label>Created</Label>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {new Date(selectedUser.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                  
                                  {getUserSubscription(selectedUser.id) && (
                                    <div>
                                      <Label>Subscription</Label>
                                      <div className="mt-2 p-3 border rounded-lg">
                                        {(() => {
                                          const sub = getUserSubscription(selectedUser.id)!;
                                          return (
                                            <div className="space-y-2">
                                              <div className="font-medium">{sub.plan.name}</div>
                                              <div className="text-sm text-muted-foreground">
                                                Status: {sub.status}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                Billing: {sub.billing_cycle}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                Ends: {new Date(sub.current_period_end).toLocaleDateString()}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <Label>Organizations ({getUserOrganizations(selectedUser.id).length})</Label>
                                    <div className="mt-2 space-y-2">
                                      {getUserOrganizations(selectedUser.id).map(org => (
                                        <div key={org.id} className="p-2 border rounded text-sm">
                                          {org.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
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
    </div>
  );
};