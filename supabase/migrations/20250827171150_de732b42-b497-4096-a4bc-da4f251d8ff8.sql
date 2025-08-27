-- Create a function to automatically give new users a trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer set search_path = public
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
  
  -- Create a trial subscription for the new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id, 
      plan_id, 
      status, 
      billing_cycle, 
      current_period_start, 
      current_period_end
    ) VALUES (
      NEW.id, 
      free_plan_id, 
      'trial', 
      'monthly', 
      NOW(), 
      NOW() + INTERVAL '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create trial subscriptions for new users
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();