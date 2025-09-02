import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Building, Users, FileText, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}

interface OrganizationStats {
  customers: number;
  invoices: number;
  purchases: number;
  totalRevenue: number;
}

export const OrganizationManagement = () => {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationStats, setOrganizationStats] = useState<Record<string, OrganizationStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editedOrg, setEditedOrg] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;
      setOrganizations(orgs || []);

      // Fetch stats for each organization
      const statsPromises = orgs?.map(async (org) => {
        const [customersResult, invoicesResult, purchasesResult] = await Promise.all([
          supabase.from('customers').select('id').eq('organization_id', org.id),
          supabase.from('invoices').select('total_amount').eq('organization_id', org.id),
          supabase.from('purchases').select('total_amount').eq('organization_id', org.id)
        ]);

        const totalRevenue = [
          ...(invoicesResult.data || []),
          ...(purchasesResult.data || [])
        ].reduce((sum, item) => sum + (item.total_amount || 0), 0);

        return {
          orgId: org.id,
          stats: {
            customers: customersResult.data?.length || 0,
            invoices: invoicesResult.data?.length || 0,
            purchases: purchasesResult.data?.length || 0,
            totalRevenue
          }
        };
      }) || [];

      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { orgId, stats }) => {
        acc[orgId] = stats;
        return acc;
      }, {} as Record<string, OrganizationStats>);

      setOrganizationStats(statsMap);
    } catch (error: any) {
      toast({
        title: "Error loading organizations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async () => {
    if (!selectedOrg) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editedOrg.name,
          description: editedOrg.description
        })
        .eq('id', selectedOrg.id);

      if (error) throw error;

      await fetchData();
      setIsSheetOpen(false);
      toast({
        title: "Organization updated",
        description: "Organization details have been saved"
      });
    } catch (error: any) {
      toast({
        title: "Error updating organization",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      await fetchData();
      toast({
        title: "Organization deleted",
        description: "Organization and all related data have been removed"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting organization",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = Object.values(organizationStats).reduce(
    (acc, stats) => ({
      customers: acc.customers + stats.customers,
      invoices: acc.invoices + stats.invoices,
      purchases: acc.purchases + stats.purchases,
      totalRevenue: acc.totalRevenue + stats.totalRevenue
    }),
    { customers: 0, invoices: 0, purchases: 0, totalRevenue: 0 }
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading organizations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Organizations</p>
                <p className="text-2xl font-bold">{organizations.length}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalStats.customers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalStats.invoices}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalStats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organization Management</h2>
          <p className="text-sm text-muted-foreground">Manage organizations and their business data</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Organization</TableHead>
                  <TableHead className="hidden sm:table-cell">Customers</TableHead>
                  <TableHead className="hidden md:table-cell">Revenue</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => {
                  const stats = organizationStats[org.id] || { customers: 0, invoices: 0, purchases: 0, totalRevenue: 0 };
                  
                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{org.name}</div>
                          {org.description && (
                            <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                              {org.description}
                            </div>
                          )}
                          <div className="font-mono text-xs text-muted-foreground">
                            {org.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{stats.customers}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.invoices} invoices, {stats.purchases} purchases
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">${stats.totalRevenue.toFixed(2)}</div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          {new Date(org.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setEditedOrg({ name: org.name, description: org.description || '' });
                                }}
                              >
                                Edit
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Organization Details</SheetTitle>
                              </SheetHeader>
                              {selectedOrg && (
                                <div className="space-y-6 mt-6">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="name">Organization Name</Label>
                                      <Input
                                        id="name"
                                        value={editedOrg.name}
                                        onChange={(e) => setEditedOrg(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-2"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="description">Description</Label>
                                      <Textarea
                                        id="description"
                                        value={editedOrg.description}
                                        onChange={(e) => setEditedOrg(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-2"
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label>Owner ID</Label>
                                      <div className="text-sm text-muted-foreground mt-1 font-mono">
                                        {selectedOrg.user_id}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Statistics</Label>
                                      <div className="mt-2 grid grid-cols-2 gap-4">
                                        <div className="p-3 border rounded-lg">
                                          <div className="text-sm text-muted-foreground">Customers</div>
                                          <div className="text-lg font-bold">{stats.customers}</div>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                          <div className="text-sm text-muted-foreground">Revenue</div>
                                          <div className="text-lg font-bold">${stats.totalRevenue.toFixed(0)}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Activity Summary</Label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span>Invoices</span>
                                          <span>{stats.invoices}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span>Purchases</span>
                                          <span>{stats.purchases}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span>Created</span>
                                          <span>{new Date(selectedOrg.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={updateOrganization}
                                      className="flex-1"
                                    >
                                      Save Changes
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => deleteOrganization(selectedOrg.id)}
                                      className="flex-1"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
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