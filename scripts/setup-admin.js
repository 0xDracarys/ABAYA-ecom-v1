#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing Supabase credentials in .env.local file');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setup-admin-user.sql'),
      'utf8'
    );

    console.log('Setting up user_roles table and policies...');
    
    // Execute SQL script in chunks
    const sqlCommands = sqlScript.split(';').filter(cmd => cmd.trim());
    
    for (const cmd of sqlCommands) {
      if (cmd.trim()) {
        await supabase.rpc('exec_sql', { query: cmd.trim() + ';' }).catch(err => {
          console.warn('SQL error (may be safely ignored if objects already exist):', err.message);
        });
      }
    }

    console.log('Creating admin user...');
    
    // Create a new admin user or update existing one
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@abaya-ecom.test',
      password: 'AdminPass123!',
      email_confirm: true,
      user_metadata: { name: 'Admin User' }
    });

    if (error && error.message !== 'User already registered') {
      throw error;
    }

    const userId = data?.user?.id || 
      (await supabase.auth.admin.listUsers()).data.users.find(
        u => u.email === 'admin@abaya-ecom.test'
      )?.id;

    if (!userId) {
      throw new Error('Failed to retrieve admin user ID');
    }

    // Ensure user has admin role in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin',
        updated_at: new Date().toISOString()
      });

    if (roleError) {
      throw roleError;
    }

// Check if required environment variables exist
const requiredEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Supabase client with service role key (admin access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAdmin() {
  try {
    console.log('⚙️ Setting up admin privileges and permissions...');

    // Read the admin policy SQL file
    const policyFilePath = path.join(__dirname, '..', 'lib', 'supabase', 'admin-policy.sql');
    const sql = fs.readFileSync(policyFilePath, 'utf8');

    // Apply SQL policy to the database
    console.log('📝 Applying admin policies to database...');
    
    // Split the SQL file into separate statements
    const statements = sql.split(';').filter(statement => statement.trim());
    
    for (const [index, statement] of statements.entries()) {
      if (statement.trim()) {
        // Execute each SQL statement
        const { error } = await supabase.rpc('pgtle_admin_sql', { 
          query: statement.trim() + ';' 
        });
        
        if (error) {
          console.error(`Error executing SQL statement ${index + 1}:`, error);
          console.error(`Statement: ${statement}`);
        } else {
          console.log(`✅ SQL statement ${index + 1} executed successfully`);
        }
      }
    }

    // Create admin user if it doesn't exist
    console.log('👤 Creating admin user if not exists...');
    
    const adminEmail = 'admin@abayaelegance.com';
    const adminPassword = 'Admin@123456';
    
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing admin user:', checkError);
    }
    
    if (!existingUser) {
      // Create the admin user
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User',
          is_admin: true
        }
      });
      
      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
      } else {
        console.log('✅ Admin user created successfully:', newUser);
        
        // Ensure the admin flag is set in the profiles table
        await supabase.rpc('make_user_admin', { user_email: adminEmail });
        console.log('🔑 Admin privileges granted to user');
      }
    } else {
      console.log('ℹ️ Admin user already exists');
      
      // Ensure the admin flag is set
      await supabase.rpc('make_user_admin', { user_email: adminEmail });
      console.log('🔑 Admin privileges confirmed');
    }
    
    console.log('✅ Admin setup complete!');
    console.log(`
    ----------------------------------------
    Admin account has been created:
    Email: ${adminEmail}
    Password: ${adminPassword}
    
    IMPORTANT: Change this password after first login!
    ----------------------------------------
    `);
    
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdmin(); 