-- Fix function search path to be immutable
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Update the function definition to be properly immutable
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';