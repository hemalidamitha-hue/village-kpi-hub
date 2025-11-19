-- First, drop the generated column constraints if they exist
ALTER TABLE public.kpi_records 
ALTER COLUMN defect_percentage DROP EXPRESSION IF EXISTS;

ALTER TABLE public.kpi_records 
ALTER COLUMN variance DROP EXPRESSION IF EXISTS;

-- Change expected_defects column from integer to numeric to support decimal percentages
ALTER TABLE public.kpi_records 
ALTER COLUMN expected_defects TYPE numeric USING expected_defects::numeric;

-- Ensure the trigger is properly set up to calculate these values
DROP TRIGGER IF EXISTS calculate_kpi_metrics_trigger ON public.kpi_records;

CREATE TRIGGER calculate_kpi_metrics_trigger
  BEFORE INSERT OR UPDATE ON public.kpi_records
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_kpi_metrics();

-- Update the calculate_kpi_metrics function to ensure proper handling
CREATE OR REPLACE FUNCTION public.calculate_kpi_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate defect percentage
  IF NEW.total_production > 0 THEN
    NEW.defect_percentage = ROUND((NEW.actual_defects::numeric / NEW.total_production::numeric * 100), 2);
  ELSE
    NEW.defect_percentage = 0;
  END IF;
  
  -- Calculate variance (actual percentage - expected percentage)
  IF NEW.total_production > 0 THEN
    NEW.variance = ROUND(NEW.defect_percentage - NEW.expected_defects, 2);
  ELSE
    NEW.variance = 0;
  END IF;
  
  RETURN NEW;
END;
$function$;