#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRolesTable() {
  console.log('Creating user_roles table directly...');
  
  try {
    // Simplest approach: directly upsert into user_roles
    // If it doesn't exist, the error will tell us
    const { error: upsertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: 'e01f87c5-9b51-419d-b293-5eb170a59950',
        role: 'admin'
      });
    
    if (upsertError) {
      if (upsertError.code === '42P01') {
        console.log('Table does not exist. Please create it manually in Supabase with SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO user_roles (user_id, role)
VALUES ('e01f87c5-9b51-419d-b293-5eb170a59950', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
        `);
      } else {
        console.error('Error assigning admin role:', upsertError);
      }
    } else {
      console.log('Admin role assigned successfully!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

createRolesTable(); 