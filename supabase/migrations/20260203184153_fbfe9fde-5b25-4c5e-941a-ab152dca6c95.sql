-- Create a public view that excludes sensitive PII (CPF, email)
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, name, surname, created_at, updated_at
  FROM public.profiles;

-- Drop the existing SELECT policy that allows direct access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a restrictive SELECT policy that denies direct table access
-- Users must use the profiles_public view instead
CREATE POLICY "No direct SELECT access to profiles"
  ON public.profiles FOR SELECT
  USING (false);

-- Grant SELECT on the view to authenticated users (view will inherit RLS from base table via security_invoker)
GRANT SELECT ON public.profiles_public TO authenticated;

-- Create RLS policy on base table for view access (security invoker means the view checks will use caller's permissions)
-- Since we need users to see their own data through the view, we need a function-based approach
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE (
  id uuid,
  name text,
  surname text,
  cpf text,
  email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, surname, cpf, email, created_at, updated_at
  FROM public.profiles
  WHERE id = auth.uid();
$$;