# Admin Authentication Troubleshooting Guide

This guide will help you resolve the admin authentication issues and fix the infinite redirect loop. The main problem was that the `user_roles` table was missing in the database, and the middleware wasn't correctly detecting authenticated sessions.

## Step 1: Create Required Database Tables

First, you need to manually create the necessary database tables in Supabase:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" tab
4. Create a new query and paste the following SQL:

```sql
-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own role" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

5. Click "Run" to execute the SQL

## Step 2: Run the Admin Setup Script

After creating the tables, run the improved admin setup script:

```bash
node scripts/setup-admin.js
```

This will:
1. Check if the `user_roles` table exists
2. Create or update the admin user
3. Assign the admin role in the `user_roles` table
4. Create a profile record for the admin

## Step 3: Clear Cache and Restart

Clear your Next.js cache and restart the development server:

```bash
rm -rf .next
npm run dev
```

## Step 4: Test Admin Login

1. Visit http://localhost:3000/auth/login
2. Log in with admin credentials:
   - Email: admin@abaya-ecom.test
   - Password: AdminPass123!
3. You should be redirected to `/admin/dashboard`

## Debugging Tips

If you're still experiencing issues:

### Check Session Cookies

1. Open your browser's developer tools
2. Go to the Application/Storage tab
3. Look for cookies under your domain
4. Verify that `sb-access-token` or similar Supabase auth cookies exist

### Inspect Server Logs

Check the console output for:
- `[Middleware]` logs - shows auth verification and redirects
- `[signIn]` logs - shows login process and role checks

### Verify Database Records

In the Supabase Dashboard:
1. Go to "Authentication" → "Users" to confirm the admin user exists
2. Go to "Table Editor" → "user_roles" to confirm the admin role is assigned
3. Check that the `user_id` matches the ID from the "Users" table

### Common Issues

1. **Missing tables**: Ensure you've created all required tables with the SQL in Step 1
2. **Role not assigned**: Verify the admin role exists in the `user_roles` table
3. **Cookie issues**: Clear browser cookies and try again
4. **RLS policies**: Check that Row Level Security policies are correctly set up

## Understanding Key Changes

The following key changes were made to fix the issues:

1. **Better database setup**: Required tables are now created with SQL rather than unreliable `exec_sql` calls
2. **Server-side auth**: Middleware now uses the server client to access session data
3. **Single source of truth**: Admin status is now determined solely by the `user_roles` table
4. **Server components**: Admin pages now use React Server Components where possible for better performance

If you continue to experience issues, try creating a new admin user through the Supabase Dashboard directly, and manually add the admin role record in the `user_roles` table. 