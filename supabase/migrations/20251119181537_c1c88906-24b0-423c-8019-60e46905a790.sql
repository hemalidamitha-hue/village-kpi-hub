-- Fix numeric field precision to handle larger values
-- Change defect_percentage and variance columns to allow larger numbers
ALTER TABLE kpi_records 
  ALTER COLUMN defect_percentage TYPE numeric(10, 2),
  ALTER COLUMN variance TYPE numeric(10, 2);