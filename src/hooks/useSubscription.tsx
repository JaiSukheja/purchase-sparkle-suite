import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_quarterly: number;
  price_annual: number;
  max_organizations: number;
  max_customers_per_org: number;
  features: any;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  plan?: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchPlans();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateOrganization = () => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trial';
  };

  const getOrganizationLimit = () => {
    if (!subscription?.plan) return 1;
    return subscription.plan.max_organizations;
  };

  const getCustomerLimit = () => {
    if (!subscription?.plan) return 100;
    return subscription.plan.max_customers_per_org;
  };

  const isFeatureAvailable = (feature: string) => {
    if (!subscription?.plan) return false;
    return subscription.plan.features.includes(feature);
  };

  return {
    subscription,
    plans,
    loading,
    canCreateOrganization,
    getOrganizationLimit,
    getCustomerLimit,
    isFeatureAvailable,
    fetchSubscription,
    fetchPlans
  };
};