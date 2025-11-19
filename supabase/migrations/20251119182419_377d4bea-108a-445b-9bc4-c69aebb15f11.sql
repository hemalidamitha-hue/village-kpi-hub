-- Create a function to automatically calculate defect_percentage and variance
CREATE OR REPLACE FUNCTION calculate_kpi_metrics()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate metrics before insert or update
DROP TRIGGER IF EXISTS trigger_calculate_kpi_metrics ON kpi_records;
CREATE TRIGGER trigger_calculate_kpi_metrics
  BEFORE INSERT OR UPDATE ON kpi_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_kpi_metrics();