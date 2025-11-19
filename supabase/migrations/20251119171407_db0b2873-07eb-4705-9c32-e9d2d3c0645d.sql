-- Fix infinite recursion in profiles table policies
-- Drop the problematic policies that query profiles within profiles SELECT
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Department heads can view department profiles" ON public.profiles;

-- Recreate them using the has_role function which bypasses RLS
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Department heads can view department profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'department_head') 
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.department = profiles.department
  )
);

-- Also fix the kpi_records policies to use has_role where appropriate
DROP POLICY IF EXISTS "Admins can view all KPI records" ON public.kpi_records;
DROP POLICY IF EXISTS "Department heads can update KPI records" ON public.kpi_records;

CREATE POLICY "Admins can view all KPI records" 
ON public.kpi_records 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Department heads can update KPI records" 
ON public.kpi_records 
FOR UPDATE 
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'department_head'))
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND department = kpi_records.department
  )
);