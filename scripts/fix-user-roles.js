#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserRoles() {
  console.log('🔧 Starting user_roles table fix...');
  
  try {
    // Step 1: Use raw SQL to create the user_roles table if it doesn't exist
    console.log('Creating user_roles table using direct SQL...');
    
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.user_roles (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `;
    
    const { error: createTableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createTableError) {
      console.log('Could not use RPC to create table. Trying alternative approach...');
      
      // Alternative: Try creating the table via REST API
      const { error: restError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);
        
      if (restError && restError.code === '42P01') {
        console.error('⚠️ The user_roles table does not exist and could not be created via API.');
        console.log('Please create it manually in the Supabase dashboard with this SQL:');
        console.log(createTableSQL);
      } else if (!restError) {
        console.log('✅ user_roles table already exists.');
      } else {
        console.error('❌ Error checking user_roles table:', restError);
      }
    } else {
      console.log('✅ user_roles table created or already exists.');
    }
    
    // Step 2: Verify admin user exists
    console.log('Verifying admin user...');
    const adminEmail = 'admin@abaya-ecom.test';
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }
    
    const adminUser = users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error(`❌ Admin user with email ${adminEmail} not found!`);
      process.exit(1);
    }
    
    console.log(`✅ Found admin user with ID: ${adminUser.id}`);
    
    // Step 3: Insert admin role directly using data API
    console.log('Adding admin role to user...');
    
    const { error: upsertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: adminUser.id,
        role: 'admin'
      });
    
    if (upsertError) {
      if (upsertError.code === '42P01') {
        console.error('❌ The user_roles table does not exist. Please create it manually.');
      } else {
        console.error('❌ Error assigning admin role:', upsertError);
      }
      
      console.log('\nManual SQL to run in Supabase SQL Editor:');
      console.log(`
INSERT INTO public.user_roles (user_id, role)
VALUES ('${adminUser.id}', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
      `);
    } else {
      console.log('✅ Admin role assigned successfully!');
    }
    
    console.log('\n🎉 Process completed!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@abaya-ecom.test');
    console.log('Password: AdminPass123!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

fixUserRoles(); 