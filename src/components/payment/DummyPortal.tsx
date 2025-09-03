import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Calendar, Download, Settings } from 'lucide-react';

const DummyPortal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, fetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('user_id');
    if (!user || user.id !== userId) {
      navigate('/auth');
    }
  }, [user, searchParams, navigate]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'active' })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your subscription details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Demo Customer Portal</h1>
            <p className="text-blue-700">
              This is a demonstration of a customer portal. In a real implementation, 
              this would connect to your payment provider's portal.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan</span>
                <span>{subscription.plan?.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Billing Cycle</span>
                <span className="capitalize">{subscription.billing_cycle}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Next Billing</span>
                <span>
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                {subscription.status === 'active' ? (
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    Cancel Subscription
                  </Button>
                ) : subscription.status === 'cancelled' ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={loading}
                    className="w-full"
                  >
                    Reactivate Subscription
                  </Button>
                ) : null}
                
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="outline"
                  className="w-full"
                >
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">•••• •••• •••• 4242</span>
                  <Badge variant="outline" className="ml-auto">Visa</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Expires 12/25</p>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                Update Payment Method
                <span className="text-xs ml-2">(Demo)</span>
              </Button>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Billing Address</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>John Doe</p>
                  <p>123 Demo Street</p>
                  <p>Demo City, DC 12345</p>
                  <p>United States</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                Update Billing Address
                <span className="text-xs ml-2">(Demo)</span>
              </Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2024-01-01', amount: subscription.plan?.price_monthly || 0, status: 'Paid' },
                  { date: '2023-12-01', amount: subscription.plan?.price_monthly || 0, status: 'Paid' },
                  { date: '2023-11-01', amount: subscription.plan?.price_monthly || 0, status: 'Paid' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Monthly subscription</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${invoice.amount}</span>
                      <Badge variant="outline">{invoice.status}</Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  In a real implementation, you would see your complete billing history here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DummyPortal;