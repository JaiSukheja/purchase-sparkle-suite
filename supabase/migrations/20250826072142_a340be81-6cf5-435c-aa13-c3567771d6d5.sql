-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_quarterly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2) NOT NULL,
  max_organizations INTEGER NOT NULL DEFAULT 1,
  max_customers_per_org INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, annual
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- percentage, fixed_amount
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID, -- admin user id
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon usage table
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, super_admin
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read access)
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "users_can_view_own_subscriptions" ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_subscriptions" ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_subscriptions" ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coupons (admin only)
CREATE POLICY "admin_can_manage_coupons" ON public.coupons
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Public can view active coupons by code for validation
CREATE POLICY "public_can_view_active_coupons" ON public.coupons
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for coupon_usage
CREATE POLICY "users_can_view_own_coupon_usage" ON public.coupon_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_coupon_usage" ON public.coupon_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for admin_users
CREATE POLICY "admin_users_can_view_themselves" ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to get user subscription with plan details
CREATE OR REPLACE FUNCTION public.get_user_subscription_details(p_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  billing_cycle TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  max_organizations INTEGER,
  max_customers_per_org INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    us.id,
    sp.name,
    us.status,
    us.billing_cycle,
    us.current_period_end,
    sp.max_organizations,
    sp.max_customers_per_org
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.status IN ('trial', 'active')
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_quarterly, price_annual, max_organizations, max_customers_per_org, features) VALUES
('Starter', 'Perfect for small businesses', 29.99, 79.99, 299.99, 1, 100, '["Customer Management", "Purchase Tracking", "Basic Invoicing"]'),
('Professional', 'For growing businesses', 59.99, 159.99, 599.99, 3, 500, '["Customer Management", "Purchase Tracking", "Advanced Invoicing", "Multiple Organizations", "Analytics"]'),
('Enterprise', 'For large businesses', 99.99, 269.99, 999.99, 10, 2000, '["Customer Management", "Purchase Tracking", "Advanced Invoicing", "Multiple Organizations", "Advanced Analytics", "Priority Support"]');

-- Add organization_limit column to organizations table to track usage
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_limited BOOLEAN DEFAULT true;