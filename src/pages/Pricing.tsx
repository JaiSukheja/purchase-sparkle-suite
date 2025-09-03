import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { plans, subscription, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading pricing plans...</div>
      </div>
    );
  }

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
        return 'per quarter';
      case 'annual':
        return 'per year';
      default:
        return 'per month';
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your business with our flexible pricing plans designed for every stage of growth
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg flex">
            {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === cycle
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'annual' && (
                  <Badge variant="secondary" className="ml-2">Save 25%</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = subscription?.plan?.id === plan.id;
            const isPopular = index === 1; // Middle plan is popular
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${getPrice(plan)}</span>
                    <span className="text-muted-foreground"> {getPeriodText()}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Up to {plan.max_organizations} organization{plan.max_organizations > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{plan.max_customers_per_org} customers per organization</span>
                    </div>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {subscription && (
          <div className="text-center mt-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
                <p className="text-muted-foreground">
                  You're on the <strong>{subscription.plan?.name}</strong> plan
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;