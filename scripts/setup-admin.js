#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Admin credentials
const ADMIN_EMAIL = 'admin@abaya-ecom.test';
const ADMIN_PASSWORD = 'AdminPass123!';

// Check required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing required environment variables');
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
  console.log('Setting up admin user...');
  console.log(`Email: ${ADMIN_EMAIL}`);

  try {
    // Step 1: List users and find or create admin
    console.log('Checking if admin user exists...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }
    
    const adminUser = users.find(user => user.email === ADMIN_EMAIL);
    let userId;
    
    if (adminUser) {
      userId = adminUser.id;
      console.log(`Admin user already exists with ID: ${userId}`);
      
      // Update admin password
      console.log('Updating admin password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (updateError) {
        throw new Error(`Error updating admin password: ${updateError.message}`);
      }
      
      console.log('Admin password updated successfully');
    } else {
      // Create admin user
      console.log('Creating new admin user...');
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      
      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }
      
      userId = data.user.id;
      console.log(`Admin user created with ID: ${userId}`);
    }
    
    // Step 2: Create user_roles table if it doesn't exist
    console.log('Checking user_roles table...');
    
    // Simple query to check if table exists
    const { error: tableError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
      
    if (tableError && tableError.code === '42P01') {
      console.log('Creating user_roles table...');
      
      // Execute raw SQL to create the table
      const { error: createTableError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createTableError) {
        console.warn('Could not create user_roles table:', createTableError.message);
        console.log('Please create it manually in the Supabase dashboard');
      } else {
        console.log('Created user_roles table successfully');
      }
    }
    
    // Step 3: Add admin role
    console.log('Assigning admin role...');
    
    // Direct SQL to insert admin role
    const { error: roleError } = await supabase.rpc('exec_sql', { 
      sql: `
        INSERT INTO user_roles (user_id, role)
        VALUES ('${userId}', 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin', updated_at = NOW();
      `
    });
    
    if (roleError) {
      console.error('Error assigning admin role:', roleError.message);
      console.error('Please assign the admin role manually in the Supabase dashboard');
    } else {
      console.log('✅ Admin role assigned successfully');
    }
    
    console.log('\nAdmin setup process complete!');
    console.log('\nAdministrator Credentials:');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
    console.log('\nIMPORTANT: Verify in your Supabase Dashboard:');
    console.log('1. Go to Authentication → Users to confirm the admin user exists');
    console.log('2. Go to Table Editor → user_roles to confirm the admin role is assigned');
    console.log('\nIf verification fails, please create/update the user and role manually.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nPlease try setting up the admin user manually:');
    console.error('1. Go to the Supabase dashboard → Authentication → Users');
    console.error('2. Create a user with email: admin@abaya-ecom.test and password: AdminPass123!');
    console.error('3. Ensure the user is confirmed (email verified)');
    console.error('4. Create a user_roles table with columns: id, user_id, role, created_at, updated_at');
    console.error('5. Insert a record with the admin\'s user_id and role="admin"');
    process.exit(1);
  }
}

setupAdmin(); 