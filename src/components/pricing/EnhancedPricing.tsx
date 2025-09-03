import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type BillingCycle = 'monthly' | 'quarterly' | 'annual';

const EnhancedPricing = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const { plans, subscription, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getPrice = (plan: any) => {
    switch (billingCycle) {
      case 'quarterly':
        return plan.price_quarterly;
      case 'annual':
        return plan.price_annual;
      default:
        return plan.price_monthly;
    }
  };

  const getPeriodText = () => {
    switch (billingCycle) {
      case 'quarterly':
        return '/quarter';
      case 'annual':
        return '/year';
      default:
        return '/month';
    }
  };

  const getDiscount = (plan: any) => {
    const monthly = plan.price_monthly;
    const current = getPrice(plan);
    
    if (billingCycle === 'quarterly') {
      const quarterlyMonthly = (plan.price_quarterly / 3);
      return Math.round(((monthly - quarterlyMonthly) / monthly) * 100);
    } else if (billingCycle === 'annual') {
      const annualMonthly = (plan.price_annual / 12);
      return Math.round(((monthly - annualMonthly) / monthly) * 100);
    }
    return 0;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'starter':
        return <Star className="h-6 w-6" />;
      case 'professional':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      // Redirect to dummy checkout
      const checkoutUrl = `/dummy-checkout?plan_id=${planId}&billing_cycle=${billingCycle}`;
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan_id === planId;
  };

  const isPopularPlan = (planName: string) => {
    return planName.toLowerCase() === 'professional';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded mx-auto w-64" />
          <div className="h-4 bg-muted animate-pulse rounded mx-auto w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start with our free plan and upgrade as your business grows. All plans include our core features.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-muted rounded-lg p-1">
          {(['monthly', 'quarterly', 'annual'] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-4 py-2 rounded-md font-medium transition-all relative ${
                billingCycle === cycle
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              {cycle === 'quarterly' && (
                <Badge variant="secondary" className="ml-2 text-xs">10% off</Badge>
              )}
              {cycle === 'annual' && (
                <Badge variant="secondary" className="ml-2 text-xs">25% off</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const discount = getDiscount(plan);
          const isPopular = isPopularPlan(plan.name);
          const isCurrent = isCurrentPlan(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isPopular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              } ${
                isCurrent ? 'ring-2 ring-primary' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-background">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {getPeriodText()}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex items-center justify-center mt-1">
                      <span className="text-sm text-muted-foreground line-through">
                        ${billingCycle === 'quarterly' ? (plan.price_monthly * 3) : (plan.price_monthly * 12)}
                      </span>
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Save {discount}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Plan Features */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Up to {plan.max_organizations} organization{plan.max_organizations > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{plan.max_customers_per_org} customers per organization</span>
                  </div>
                  
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${
                    isPopular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : ''
                  }`}
                  variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Info */}
      {subscription && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Your Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{subscription.plan?.name} Plan</p>
                <p className="text-sm text-muted-foreground">
                  Next billing: {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Contact */}
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
        <p className="text-muted-foreground mb-6">
          Contact us for enterprise solutions with custom features and pricing.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default EnhancedPricing;