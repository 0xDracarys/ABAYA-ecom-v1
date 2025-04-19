-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own role
CREATE POLICY user_roles_select_policy ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow admins to manage all roles
CREATE POLICY admin_roles_all_policy ON public.user_roles
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS TEXT AS $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_uid FROM auth.users 
  WHERE email = 'admin@abaya-ecom.test' 
  LIMIT 1;
  
  -- If admin doesn't exist, create one
  IF admin_uid IS NULL THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role
    ) VALUES (
      'admin@abaya-ecom.test',
      -- Password: AdminPass123!
      crypt('AdminPass123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      NOW(),
      NOW(),
      'authenticated'
    )
    RETURNING id INTO admin_uid;
  END IF;
  
  -- Add admin role if not already added
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_uid, 'admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin', updated_at = NOW();
  
  RETURN 'Admin user created or updated with email: admin@abaya-ecom.test and password: AdminPass123!';
END;
$$ LANGUAGE plpgsql; 