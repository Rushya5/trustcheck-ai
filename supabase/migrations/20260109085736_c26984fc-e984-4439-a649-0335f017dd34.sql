-- Fix function search path for generate_case_number
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.cases;
  RETURN 'TC-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;