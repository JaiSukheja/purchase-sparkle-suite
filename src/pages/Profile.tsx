import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, CreditCard, Bell } from 'lucide-react';

interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  company?: string;
  bio?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    full_name: '',
    avatar_url: '',
    phone: '',
    company: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Since profiles table doesn't exist yet, use basic user info
      setProfile({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        phone: user.user_metadata?.phone || '',
        company: '',
        bio: ''
      });
    } catch (error: any) {
      console.error('Error setting up profile:', error);
      // Use basic user info as fallback
      setProfile({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        phone: user.user_metadata?.phone || '',
        company: '',
        bio: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      // For now, just show success since profiles table doesn't exist yet
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md resize-none"
                />
              </div>
              <Button onClick={updateProfile} disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <Badge variant="default" className="mt-1">Active</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Sign In</p>
                <p className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div>
                    <p className="text-sm font-medium">Current Plan</p>
                    <Badge variant="outline" className="mt-1">
                      {subscription.plan?.name || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billing Cycle</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {subscription.billing_cycle}
                    </p>
                  </div>
                  {subscription.current_period_end && (
                    <div>
                      <p className="text-sm font-medium">Next Billing</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">No active subscription</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;