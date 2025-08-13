-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.loan_applications;

-- Simple RLS Policies for users table (no recursion)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin access will be handled in the application layer, not RLS
-- This prevents the recursion issue

-- RLS Policies for loan_applications table
CREATE POLICY "Users can view own applications" ON public.loan_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.loan_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.loan_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- For admin access to loan applications, we'll use the service role key
-- which bypasses RLS entirely
