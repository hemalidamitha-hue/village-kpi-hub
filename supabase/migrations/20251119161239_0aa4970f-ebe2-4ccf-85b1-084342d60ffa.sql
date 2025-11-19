-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view KPI records" ON public.kpi_records;
DROP POLICY IF EXISTS "Users can view meetings" ON public.quality_circle_meetings;
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view recognitions" ON public.recognitions;

-- Create restricted SELECT policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Department heads can view department profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'department_head' 
    AND p.department = profiles.department
  )
);

-- Create restricted SELECT policies for kpi_records
CREATE POLICY "Users can view own department KPI records" 
ON public.kpi_records 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND department = kpi_records.department
  )
);

CREATE POLICY "Admins can view all KPI records" 
ON public.kpi_records 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create restricted SELECT policies for quality_circle_meetings
CREATE POLICY "Users can view meetings for their department" 
ON public.quality_circle_meetings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND department = ANY(quality_circle_meetings.departments)
  )
);

CREATE POLICY "Quality leaders and admins can view all meetings" 
ON public.quality_circle_meetings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'quality_circle_leader')
  )
);

-- Create restricted SELECT policies for tasks
CREATE POLICY "Users can view assigned tasks" 
ON public.tasks 
FOR SELECT 
USING (assigned_to = auth.uid());

CREATE POLICY "Users can view department tasks" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND department = tasks.assigned_department
  )
);

CREATE POLICY "Quality leaders and admins can view all tasks" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'quality_circle_leader')
  )
);

-- Create restricted SELECT policies for recognitions
CREATE POLICY "Users can view own recognitions" 
ON public.recognitions 
FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "Users can view department recognitions" 
ON public.recognitions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND department = recognitions.recipient_department
  )
);

CREATE POLICY "Admins can view all recognitions" 
ON public.recognitions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add missing INSERT policy for tasks
CREATE POLICY "Quality leaders can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'quality_circle_leader')
  )
);

-- Add UPDATE and DELETE policies for meetings
CREATE POLICY "Quality leaders can update meetings" 
ON public.quality_circle_meetings 
FOR UPDATE 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Quality leaders can delete meetings" 
ON public.quality_circle_meetings 
FOR DELETE 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);