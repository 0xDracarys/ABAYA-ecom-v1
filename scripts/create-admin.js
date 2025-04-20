#!/usr/bin/env node

/**
 * SPECIFIC ADMIN USER CREATION SCRIPT
 * ----------------------------------
 * This script creates a specific admin user with predefined credentials
 * Run with: node scripts/create-admin.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Admin credentials
const ADMIN_EMAIL = 'samAdmin@gmail.com';
const ADMIN_PASSWORD = 'Sam121212';

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

async function createSpecificAdmin() {
  console.log('🔧 Creating specific admin user...');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);

  try {
    // Create the user
    console.log('➕ Creating new admin user...');
    let userData;
    
    try {
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (createError) {
        if (createError.message.includes('already exists')) {
          console.log('✅ User already exists, updating password and continuing...');
          
          // Get the user ID if the user already exists
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          
          if (listError) {
            throw new Error(`Error listing users: ${listError.message}`);
          }
          
          const existingUser = users.find(user => user.email === ADMIN_EMAIL);
          
          if (!existingUser) {
            throw new Error('User exists but could not be found in user list');
          }
          
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: ADMIN_PASSWORD,
            email_confirm: true
          });
          
          if (updateError) {
            throw new Error(`Error updating admin password: ${updateError.message}`);
          }
          
          console.log('✅ Password updated successfully');
          
          // Proceed with the existing user ID
          userData = { user: existingUser };
        } else {
          throw createError;
        }
      } else {
        userData = data;
      }
    } catch (error) {
      console.error(`❌ Error with user creation/update: ${error.message}`);
      
      // Attempt to get the user anyway if they exist
      console.log('🔍 Attempting to find user in database...');
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        throw new Error(`Error listing users: ${listError.message}`);
      }
      
      const existingUser = users.find(user => user.email === ADMIN_EMAIL);
      
      if (!existingUser) {
        throw new Error('Cannot proceed without creating or finding the user');
      }
      
      userData = { user: existingUser };
    }
    
    const userId = userData.user.id;
    console.log(`✅ Admin user created/updated with ID: ${userId}`);
    
    // Assign admin role
    console.log('🔑 Assigning admin role...');
    
    try {
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
    } catch (roleError) {
      console.error(`❌ Error with role assignment: ${roleError.message}`);
      console.error('Make sure the user_roles table exists in your database');
      console.error('Run the SQL commands from scripts/create-tables.sql in the Supabase SQL Editor');
    }
    
    // Ensure profile exists
    console.log('🧩 Ensuring admin profile exists...');
    
    try {
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
    } catch (profileError) {
      console.warn(`⚠️ Error updating profile: ${profileError.message}`);
      console.warn('Make sure the profiles table exists in your database');
    }
    
    console.log('\n✅ Admin setup process complete!');
    console.log('\n👤 Administrator Credentials:');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Execute the setup
createSpecificAdmin(); 