-- 1. Add new statuses to the database enum
ALTER TYPE public.kpi_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.kpi_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Fix Update Policy so Admins can update ANY record (not just their department)
DROP POLICY IF EXISTS "Department heads can update KPI records" ON public.kpi_records;

CREATE POLICY "Admins and Dept Heads Update"
ON public.kpi_records
FOR UPDATE USING (
    -- Admins can update everything
    has_role(auth.uid(), 'admin'::user_role) OR
    -- Dept heads can only update their own department
    (
        has_role(auth.uid(), 'department_head'::user_role) AND
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
            AND department = kpi_records.department
        )
    )
);