#!/usr/bin/env node

/**
 * This script validates Supabase connection and can initialize database tables
 * Run with: node scripts/setup-supabase.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Table definitions
const createTables = [
  // Categories table
  `
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `,
  
  // Tags table
  `
  CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `,
  
  // Products table
  `
  CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `,
  
  // Product Tags junction table
  `
  CREATE TABLE IF NOT EXISTS product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
  )
  `,
  
  // User Roles table
  `
  CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `,
  
  // Profiles table (links to Supabase auth.users)
  `
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `,
  
  // Product Reviews table
  `
  CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
  )
  `,
  
  // Contact Submissions table
  `
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(20),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
  `
]

// Main function
async function main() {
  process.stdout.write('🔄 Setting up Supabase tables...\n')
  
  try {
    // Create products table
    const { error: productsError } = await supabase.rpc('create_products_table_if_not_exists')
    
    if (productsError) {
      // If RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('products')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (error && error.code === '42P01') { // Table doesn't exist
        const { error: createError } = await supabase.query(`
          CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT,
            in_stock BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        
        if (createError) throw createError
        process.stdout.write('✅ Products table created successfully\n')
      } else if (error && error.code !== '42P01') {
        throw error
      } else {
        process.stdout.write('✅ Products table already exists\n')
      }
    } else {
      process.stdout.write('✅ Products table created/verified successfully\n')
    }

    // Create orders table
    const { error: ordersError } = await supabase.rpc('create_orders_table_if_not_exists')
    
    if (ordersError) {
      // If RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('orders')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (error && error.code === '42P01') { // Table doesn't exist
        const { error: createError } = await supabase.query(`
          CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            status TEXT NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            shipping_address JSONB,
            payment_intent_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        
        if (createError) throw createError
        process.stdout.write('✅ Orders table created successfully\n')
      } else if (error && error.code !== '42P01') {
        throw error
      } else {
        process.stdout.write('✅ Orders table already exists\n')
      }
    } else {
      process.stdout.write('✅ Orders table created/verified successfully\n')
    }

    // Create order_items table
    const { error: orderItemsError } = await supabase.rpc('create_order_items_table_if_not_exists')
    
    if (orderItemsError) {
      // If RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('order_items')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (error && error.code === '42P01') { // Table doesn't exist
        const { error: createError } = await supabase.query(`
          CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        
        if (createError) throw createError
        process.stdout.write('✅ Order items table created successfully\n')
      } else if (error && error.code !== '42P01') {
        throw error
      } else {
        process.stdout.write('✅ Order items table already exists\n')
      }
    } else {
      process.stdout.write('✅ Order items table created/verified successfully\n')
    }

    process.stdout.write('🎉 Supabase tables set up successfully!\n')
  } catch (error) {
    console.error('❌ Error setting up Supabase tables:', error)
    process.exit(1)
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Script execution failed:', error)
  process.exit(1)
}) 