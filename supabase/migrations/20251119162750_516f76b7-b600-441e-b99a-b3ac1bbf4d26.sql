-- Add total_production field to kpi_records table
ALTER TABLE public.kpi_records 
ADD COLUMN IF NOT EXISTS total_production integer NOT NULL DEFAULT 0;

-- Update the column to remove the default after adding it
ALTER TABLE public.kpi_records 
ALTER COLUMN total_production DROP DEFAULT;