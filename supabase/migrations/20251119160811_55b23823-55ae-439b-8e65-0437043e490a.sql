-- Drop and recreate the trigger to ensure it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add INSERT policy for profiles table to allow the function to work
CREATE POLICY "Allow profile creation on signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);