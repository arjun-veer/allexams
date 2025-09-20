-- Drop the restrictive policy and create a more permissive one for testing
DROP POLICY IF EXISTS "Anyone can view verified exams" ON public.exams;

-- Allow anyone to view all exams (remove is_verified restriction)
CREATE POLICY "Anyone can view all exams"
ON public.exams FOR SELECT
USING (true);

-- Also ensure all existing exams are marked as verified
UPDATE public.exams SET is_verified = true WHERE is_verified = false OR is_verified IS NULL;
