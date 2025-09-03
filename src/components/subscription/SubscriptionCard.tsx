import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useDummyPayment } from '@/hooks/useDummyPayment';
import { Settings, Calendar, CreditCard } from 'lucide-react';

export const SubscriptionCard = () => {
  const { subscription, loading } = useSubscription();
  const { createCustomerPortalSession } = useDummyPayment();

  const handleManageSubscription = async () => {
    try {
      const { url } = await createCustomerPortalSession();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to a plan to access premium features
            </p>
            <Button size="sm">View Plans</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Current Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">{subscription.plan?.name} Plan</span>
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Next billing: {subscription.current_period_end 
              ? new Date(subscription.current_period_end).toLocaleDateString()
              : 'N/A'
            }
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span className="capitalize">{subscription.billing_cycle} billing</span>
        </div>
        
        <Button 
          onClick={handleManageSubscription}
          variant="outline" 
          className="w-full"
          size="sm"
        >
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
};