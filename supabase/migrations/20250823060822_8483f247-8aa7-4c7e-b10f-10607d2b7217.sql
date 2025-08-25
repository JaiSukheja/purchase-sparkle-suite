-- Create organizations table for multi-organization support
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can view their own organizations" 
ON public.organizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations" 
ON public.organizations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organizations" 
ON public.organizations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add organization_id to customers table
ALTER TABLE public.customers 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to purchases table
ALTER TABLE public.purchases 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to invoices table
ALTER TABLE public.invoices 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();