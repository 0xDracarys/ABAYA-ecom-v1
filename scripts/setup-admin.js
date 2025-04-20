#!/usr/bin/env node

/**
 * ADMIN USER SETUP SCRIPT
 * -----------------------
 * This script creates/updates an admin user and assigns the admin role.
 * 
 * IMPORTANT: Before running this script, you MUST create the user_roles table
 * in your Supabase database using the SQL below through the Supabase SQL Editor:
 * 
 * -- Run this in the Supabase SQL Editor first:
 * CREATE TABLE IF NOT EXISTS public.user_roles (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   role TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(user_id)
 * );
 * CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
 * 
 * -- If you also need to create the profiles table:
 * CREATE TABLE IF NOT EXISTS public.profiles (
 *   id UUID REFERENCES auth.users(id) PRIMARY KEY,
 *   email TEXT,
 *   full_name TEXT,
 *   avatar_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create RLS policies
 * CREATE POLICY "Users can read their own role" 
 *   ON public.user_roles FOR SELECT 
 *   USING (auth.uid() = user_id);
 * 
 * CREATE POLICY "Public profiles are viewable by everyone"
 *   ON public.profiles FOR SELECT
 *   USING (true);
 * 
 * Run with: node scripts/setup-admin.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Admin credentials
const ADMIN_EMAIL = 'admin@abaya-ecom.test';
const ADMIN_PASSWORD = 'AdminPass123!';

// Check required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure the following variables are set in .env.local:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log('🔧 Setting up admin user...');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);

  try {
    // Step 1: Verify the user_roles table exists
    console.log('🔍 Checking if user_roles table exists...');
    
    const { error: tableCheckError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
      
    if (tableCheckError) {
      console.error('❌ Error accessing user_roles table: ', tableCheckError.message);
      console.error('');
      console.error('IMPORTANT: You must create the user_roles table first!');
      console.error('Please run the SQL commands listed at the top of this script');
      console.error('in the Supabase SQL Editor, then run this script again.');
      process.exit(1);
    }
    
    console.log('✅ user_roles table exists');

    // Step 2: List users and find or create admin
    console.log('🔍 Checking if admin user exists...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }
    
    console.log(`Found ${users.length} users in the system`);
    const adminUser = users.find(user => user.email === ADMIN_EMAIL);
    let userId;
    
    if (adminUser) {
      userId = adminUser.id;
      console.log(`✅ Admin user already exists with ID: ${userId}`);
      
      // Update admin password
      console.log('🔄 Updating admin password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (updateError) {
        throw new Error(`Error updating admin password: ${updateError.message}`);
      }
      
      console.log('✅ Admin password updated successfully');
    } else {
      // Create admin user
      console.log('➕ Creating new admin user...');
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }
      
      userId = data.user.id;
      console.log(`✅ Admin user created with ID: ${userId}`);
    }
    
    // Step 3: Assign admin role
    console.log('🔑 Assigning admin role...');
    
    const { error: upsertError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: 'admin',
        updated_at: new Date().toISOString()
      });
    
    if (upsertError) {
      throw new Error(`Error assigning admin role: ${upsertError.message}`);
    }
    
    console.log('✅ Admin role assigned successfully');
    
    // Step 4: Ensure profile exists
    console.log('🧩 Ensuring admin profile exists...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: ADMIN_EMAIL,
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.warn(`⚠️ Could not update profile: ${profileError.message}`);
      console.warn('This is not critical, but you may want to manually create the profile entry.');
    } else {
      console.log('✅ Profile updated successfully');
    }
    
    console.log('\n✅ Admin setup process complete!');
    console.log('\n👤 Administrator Credentials:');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    
    console.log('\n⚠️ IMPORTANT: Verify in your Supabase Dashboard:');
    console.log('1. Go to Authentication → Users to confirm the admin user exists');
    console.log('2. Go to Table Editor → user_roles to confirm the admin role is assigned');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nPlease try setting up the admin user manually:');
    console.error('1. Create the tables using the SQL at the top of this script');
    console.error('2. Go to the Supabase dashboard → Authentication → Users');
    console.error(`3. Create a user with email: ${ADMIN_EMAIL} and password: ${ADMIN_PASSWORD}`);
    console.error('4. Ensure the user is confirmed (email verified)');
    console.error('5. Insert a record in user_roles with the admin\'s user_id and role="admin"');
    process.exit(1);
  }
}

// Execute the setup
setupAdmin(); 