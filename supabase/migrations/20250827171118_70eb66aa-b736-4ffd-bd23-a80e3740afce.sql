-- Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (id, name, description, price_monthly, price_quarterly, price_annual, max_organizations, max_customers_per_org, features) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Free', 'Perfect for getting started', 0, 0, 0, 1, 10, '["Customer Management", "Basic Purchase Tracking", "Basic Invoicing"]'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Starter', 'Perfect for small businesses', 29.99, 79.99, 299.99, 1, 100, '["Customer Management", "Purchase Tracking", "Basic Invoicing", "Reports"]'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Professional', 'For growing businesses', 59.99, 159.99, 599.99, 3, 500, '["Customer Management", "Purchase Tracking", "Advanced Invoicing", "Multiple Organizations", "Advanced Analytics"]'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Enterprise', 'For large businesses', 99.99, 269.99, 999.99, 10, 2000, '["Customer Management", "Purchase Tracking", "Advanced Invoicing", "Multiple Organizations", "Advanced Analytics", "Priority Support"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_quarterly = EXCLUDED.price_quarterly,
  price_annual = EXCLUDED.price_annual,
  max_organizations = EXCLUDED.max_organizations,
  max_customers_per_org = EXCLUDED.max_customers_per_org,
  features = EXCLUDED.features;