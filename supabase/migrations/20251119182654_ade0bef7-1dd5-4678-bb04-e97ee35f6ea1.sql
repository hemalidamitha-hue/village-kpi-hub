-- Allow admins to delete KPI records (for reset functionality)
CREATE POLICY "Admins can delete KPI records"
ON public.kpi_records
FOR DELETE
USING (has_role(auth.uid(), 'admin'));