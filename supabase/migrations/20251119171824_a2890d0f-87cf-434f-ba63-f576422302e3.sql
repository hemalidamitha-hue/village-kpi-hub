-- Fix infinite recursion in profiles RLS by using a security definer helper

-- 1) Create helper function to get a user's department without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id uuid)
RETURNS public.department_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
$$;

-- 2) Recreate the department-head profiles SELECT policy to use the helper instead of self-query
DROP POLICY IF EXISTS "Department heads can view department profiles" ON public.profiles;

CREATE POLICY "Department heads can view department profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'department_head')
  AND profiles.department = public.get_user_department(auth.uid())
);