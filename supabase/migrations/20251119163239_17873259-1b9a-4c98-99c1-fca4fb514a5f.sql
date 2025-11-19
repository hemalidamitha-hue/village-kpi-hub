-- Add INSERT policy for users to create their own role during signup
CREATE POLICY "Users can insert own role during signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());