-- Drop and recreate the activity_logs foreign key with CASCADE delete
ALTER TABLE public.activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_case_id_fkey;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_case_id_fkey 
FOREIGN KEY (case_id) 
REFERENCES public.cases(id) 
ON DELETE CASCADE;