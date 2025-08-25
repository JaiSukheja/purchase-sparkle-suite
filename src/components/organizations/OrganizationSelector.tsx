import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  description?: string;
}

interface OrganizationSelectorProps {
  selectedOrgId?: string;
  onOrganizationChange: (orgId: string) => void;
}

export const OrganizationSelector = ({ selectedOrgId, onOrganizationChange }: OrganizationSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
      
      // If no organization is selected and there's only one, select it
      if (!selectedOrgId && data && data.length === 1) {
        onOrganizationChange(data[0].id);
      }
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

  const createOrganization = async () => {
    if (!user || !newOrgName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName.trim(),
          description: newOrgDescription.trim() || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => [...prev, data]);
      onOrganizationChange(data.id);
      setShowCreateDialog(false);
      setNewOrgName('');
      setNewOrgDescription('');
      
      toast({
        title: "Organization created",
        description: `${data.name} has been created successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error creating organization",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="h-10 bg-muted animate-pulse rounded" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select value={selectedOrgId} onValueChange={onOrganizationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization..." />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {org.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Textarea
                id="orgDescription"
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                placeholder="Brief description of the organization"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={createOrganization}
                disabled={creating || !newOrgName.trim()}
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};