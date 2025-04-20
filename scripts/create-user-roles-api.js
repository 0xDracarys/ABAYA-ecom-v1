#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user ID - from your setup-admin.js output
const ADMIN_USER_ID = 'e01f87c5-9b51-419d-b293-5eb170a59950';
const ADMIN_EMAIL = 'admin@abaya-ecom.test';

async function createUserRoleDirectly() {
  console.log('🔧 Direct admin role assignment...');
  
  try {
    // Step 1: Check if the user exists
    console.log(`Checking if admin user exists with ID: ${ADMIN_USER_ID}`);
    
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error listing users: ${userError.message}`);
    }
    
    const adminUser = users.find(user => user.id === ADMIN_USER_ID || user.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      console.error(`❌ Admin user not found with ID: ${ADMIN_USER_ID} or email: ${ADMIN_EMAIL}`);
      
      // Try to create a new admin user
      console.log('Creating new admin user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: 'AdminPass123!',
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }
      
      console.log(`✅ Created new admin user with ID: ${newUser.user.id}`);
      adminUser = newUser.user;
    } else {
      console.log(`✅ Found admin user: ${adminUser.email}`);
    }
    
    // Step 2: Create profiles table if it doesn't exist
    console.log('Creating profiles table if needed...');
    
    try {
      // Try to create a simple profile for admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: adminUser.email,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError && profileError.code !== '23505') { // Ignore duplicate key value violates unique constraint
        console.warn(`Warning creating profile: ${profileError.message}`);
      } else {
        console.log('✅ Profile entry created or updated');
      }
    } catch (profileErr) {
      console.warn('Warning: Could not create profile:', profileErr.message);
    }
    
    // Step 3: Create user_roles entry directly
    console.log('Creating user_roles table if needed and adding admin role...');
    
    // First try to simple insert
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: adminUser.id,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (!roleError) {
        console.log('✅ Admin role assigned successfully!');
      } else if (roleError.code === '42P01') {
        console.log('User roles table does not exist yet. Need to create it first.');
      } else {
        console.warn(`Warning assigning role: ${roleError.message}`);
      }
    } catch (roleErr) {
      console.warn('Warning: Could not assign role:', roleErr.message);
    }
    
    // Provide SQL for manual execution
    console.log(`
------------------------------------------------------
⚠️  IMPORTANT: Execute this SQL in Supabase SQL Editor
------------------------------------------------------

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin role for user
INSERT INTO public.user_roles (user_id, role)
VALUES ('${adminUser.id}', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();

-- Enable RLS on the table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own role
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy for admins to manage all roles
CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );
`);

    console.log(`
------------------------------------------------------
✅ Success! Admin user should now have access
------------------------------------------------------
Admin Email: ${adminUser.email}
Admin Password: AdminPass123!
    `);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUserRoleDirectly();