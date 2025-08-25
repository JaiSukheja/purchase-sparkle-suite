-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.authenticate_customer(p_email TEXT, p_password TEXT)
RETURNS TABLE(customer_id UUID, customer_name TEXT, customer_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email
  FROM public.customers c
  JOIN public.customer_auth ca ON c.id = ca.customer_id
  WHERE ca.email = p_email 
    AND ca.password_hash = crypt(p_password, ca.password_hash);
END;
$$;