-- Create customer authentication table
CREATE TABLE public.customer_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for customer auth
CREATE POLICY "Customers can view their own auth" 
ON public.customer_auth 
FOR SELECT 
USING (customer_id IN (
  SELECT id FROM public.customers WHERE id = customer_auth.customer_id
));

-- Create customer comments table
CREATE TABLE public.customer_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for customer comments
CREATE POLICY "Customers can view their own comments" 
ON public.customer_comments 
FOR SELECT 
USING (customer_id IN (
  SELECT id FROM public.customers WHERE id = customer_comments.customer_id
));

CREATE POLICY "Customers can create their own comments" 
ON public.customer_comments 
FOR INSERT 
WITH CHECK (customer_id IN (
  SELECT id FROM public.customers WHERE id = customer_comments.customer_id
));

-- Add trigger for customer auth timestamps
CREATE TRIGGER update_customer_auth_updated_at
BEFORE UPDATE ON public.customer_auth
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to authenticate customer
CREATE OR REPLACE FUNCTION public.authenticate_customer(p_email TEXT, p_password TEXT)
RETURNS TABLE(customer_id UUID, customer_name TEXT, customer_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
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