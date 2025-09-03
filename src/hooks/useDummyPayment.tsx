import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentSession {
  id: string;
  url: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

export const useDummyPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (planId: string, billingCycle: 'monthly' | 'quarterly' | 'annual' = 'monthly') => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    try {
      // Fetch plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      const amount = billingCycle === 'annual' 
        ? plan.price_annual 
        : billingCycle === 'quarterly'
        ? plan.price_quarterly
        : plan.price_monthly;

      // Create dummy session
      const sessionId = `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: PaymentSession = {
        id: sessionId,
        url: `/dummy-checkout?session_id=${sessionId}&plan_id=${planId}&billing_cycle=${billingCycle}&amount=${amount}`,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount: amount,
        status: 'pending'
      };

      // Store session in localStorage for demo purposes
      localStorage.setItem(`payment_session_${sessionId}`, JSON.stringify(session));

      toast({
        title: "Checkout Session Created",
        description: "Redirecting to dummy payment gateway...",
      });

      return session;
    } catch (error: any) {
      toast({
        title: "Error creating checkout session",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (sessionId: string, success: boolean = true) => {
    try {
      const sessionData = localStorage.getItem(`payment_session_${sessionId}`);
      if (!sessionData) {
        throw new Error('Payment session not found');
      }

      const session: PaymentSession = JSON.parse(sessionData);
      
      if (success) {
        // Simulate successful payment - update user subscription
        const periodStart = new Date();
        let periodEnd = new Date();
        
        if (session.billing_cycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else if (session.billing_cycle === 'quarterly') {
          periodEnd.setMonth(periodEnd.getMonth() + 3);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Update user subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user?.id,
            plan_id: session.plan_id,
            status: 'active',
            billing_cycle: session.billing_cycle,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;

        // Update session status
        session.status = 'completed';
        localStorage.setItem(`payment_session_${sessionId}`, JSON.stringify(session));

        toast({
          title: "Payment Successful!",
          description: `Your ${session.billing_cycle} subscription has been activated.`,
        });
      } else {
        session.status = 'failed';
        localStorage.setItem(`payment_session_${sessionId}`, JSON.stringify(session));

        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive"
        });
      }

      return session;
    } catch (error: any) {
      toast({
        title: "Error processing payment",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createCustomerPortalSession = async () => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Create dummy portal URL
    const portalUrl = `/dummy-portal?user_id=${user.id}`;
    
    toast({
      title: "Customer Portal",
      description: "Redirecting to subscription management...",
    });

    return { url: portalUrl };
  };

  return {
    createCheckoutSession,
    simulatePayment,
    createCustomerPortalSession,
    loading
  };
};