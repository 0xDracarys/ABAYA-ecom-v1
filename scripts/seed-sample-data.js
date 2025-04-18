#!/usr/bin/env node

/**
 * This script adds sample data to the Supabase database for testing
 * Run with: node scripts/seed-sample-data.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample data
const sampleCategories = [
  { name: 'Abayas', description: 'Traditional and modern Abayas for all occasions', image_url: 'https://source.unsplash.com/random/800x600/?abaya' },
  { name: 'Jilbabs', description: 'Elegant Jilbabs with various styles', image_url: 'https://source.unsplash.com/random/800x600/?jilbab' },
  { name: 'Hijabs', description: 'Beautiful Hijabs in different materials and colors', image_url: 'https://source.unsplash.com/random/800x600/?hijab' },
  { name: 'Prayer Sets', description: 'Comfortable prayer sets for daily prayers', image_url: 'https://source.unsplash.com/random/800x600/?prayer' }
]

const sampleTags = [
  { name: 'New Arrival' },
  { name: 'Bestseller' },
  { name: 'Sale' },
  { name: 'Limited Edition' },
  { name: 'Modest' },
  { name: 'Casual' },
  { name: 'Formal' },
  { name: 'Summer' },
  { name: 'Winter' }
]

// Sample products function - will be populated after getting category and tag IDs
async function createSampleProducts(categories, tags) {
  const products = [
    {
      name: 'Classic Black Abaya',
      description: 'A timeless black abaya with simple, elegant design. Perfect for everyday wear and formal occasions.',
      price: 89.99,
      image_url: 'https://source.unsplash.com/random/800x600/?black+abaya',
      category_id: categories.find(c => c.name === 'Abayas').id,
      stock: 50,
      featured: true,
      tags: [
        tags.find(t => t.name === 'Bestseller').id,
        tags.find(t => t.name === 'Formal').id
      ]
    },
    {
      name: 'Embroidered Open Abaya',
      description: 'Beautiful open abaya with intricate embroidery details on the sleeves and shoulders.',
      price: 129.99,
      image_url: 'https://source.unsplash.com/random/800x600/?embroidered+abaya',
      category_id: categories.find(c => c.name === 'Abayas').id,
      stock: 30,
      featured: true,
      tags: [
        tags.find(t => t.name === 'New Arrival').id,
        tags.find(t => t.name === 'Limited Edition').id
      ]
    },
    {
      name: 'Casual Summer Jilbab',
      description: 'Lightweight jilbab perfect for warm weather. Made from breathable cotton blend.',
      price: 75.50,
      image_url: 'https://source.unsplash.com/random/800x600/?summer+jilbab',
      category_id: categories.find(c => c.name === 'Jilbabs').id,
      stock: 45,
      featured: false,
      tags: [
        tags.find(t => t.name === 'Casual').id,
        tags.find(t => t.name === 'Summer').id
      ]
    },
    {
      name: 'Premium Silk Hijab',
      description: 'Luxurious silk hijab with smooth finish and rich color. Perfect for special occasions.',
      price: 45.99,
      image_url: 'https://source.unsplash.com/random/800x600/?silk+hijab',
      category_id: categories.find(c => c.name === 'Hijabs').id,
      stock: 60,
      featured: true,
      tags: [
        tags.find(t => t.name === 'Bestseller').id,
        tags.find(t => t.name === 'Formal').id
      ]
    },
    {
      name: 'Cotton Prayer Set',
      description: 'Comfortable cotton prayer set including prayer dress and hijab. Easy to carry in the included pouch.',
      price: 39.99,
      image_url: 'https://source.unsplash.com/random/800x600/?prayer+dress',
      category_id: categories.find(c => c.name === 'Prayer Sets').id,
      stock: 75,
      featured: false,
      tags: [
        tags.find(t => t.name === 'Modest').id
      ]
    },
    {
      name: 'Winter Collection Abaya',
      description: 'Warm abaya made from heavier material perfect for colder months. Includes subtle side pockets.',
      price: 149.99,
      image_url: 'https://source.unsplash.com/random/800x600/?winter+abaya',
      category_id: categories.find(c => c.name === 'Abayas').id,
      stock: 25,
      featured: true,
      tags: [
        tags.find(t => t.name === 'Winter').id,
        tags.find(t => t.name === 'New Arrival').id
      ]
    },
    {
      name: 'Jersey Hijab 2-Pack',
      description: 'Set of two comfortable jersey hijabs in versatile colors. Perfect for everyday wear.',
      price: 29.99,
      image_url: 'https://source.unsplash.com/random/800x600/?jersey+hijab',
      category_id: categories.find(c => c.name === 'Hijabs').id,
      stock: 100,
      featured: true,
      tags: [
        tags.find(t => t.name === 'Bestseller').id,
        tags.find(t => t.name === 'Casual').id,
        tags.find(t => t.name === 'Sale').id
      ]
    }
  ]

  process.stdout.write('📦 Creating sample products...\n')
  
  // Insert products
  const { data: createdProducts, error: productsError } = await supabase
    .from('products')
    .insert(products.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      category_id: p.category_id,
      stock: p.stock,
      featured: p.featured
    })))
    .select()
  
  if (productsError) {
    console.error('❌ Error creating products:', productsError)
    return
  }
  
  // Insert product tags
  process.stdout.write('🏷️  Adding tags to products...\n')
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const createdProduct = createdProducts[i]
    
    if (product.tags && product.tags.length > 0) {
      const productTags = product.tags.map(tagId => ({
        product_id: createdProduct.id,
        tag_id: tagId
      }))
      
      const { error: tagError } = await supabase
        .from('product_tags')
        .insert(productTags)
      
      if (tagError) {
        console.error(`❌ Error adding tags to product ${product.name}:`, tagError)
      }
    }
  }
  
  process.stdout.write(`✅ Created ${createdProducts.length} sample products with tags\n`)
}

// Create admin user function
async function createAdminUser() {
  process.stdout.write('👑 Creating/updating admin user...\n')

  // Create or update admin role
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'admin@abaya-ecom.com',
    password: 'Admin123!',
    email_confirm: true,  // Auto-confirm the email
  })

  if (userError) {
    console.error('❌ Error creating admin user:', userError)
    
    // If user already exists, continue
    if (!userError.message.includes('already exists')) {
      return
    }
  }

  const userId = userData?.user?.id
  if (!userId) {
    // Try to get user ID if user already exists
    const { data: existingUser } = await supabase.auth.admin
      .listUsers({ email: 'admin@abaya-ecom.com' })
    
    if (!existingUser?.users?.[0]?.id) {
      console.error('❌ Could not get admin user ID')
      return
    }
  }

  // Add admin role
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId || existingUser.users[0].id,
      role: 'admin'
    })

  if (roleError) {
    console.error('❌ Error setting admin role:', roleError)
    return
  }

  process.stdout.write('✅ Admin user created/updated (admin@abaya-ecom.com / Admin123!)\n')
}

// Main function
async function main() {
  process.stdout.write('🌱 Starting to seed sample data...\n')
  
  // Create categories
  process.stdout.write('🗂️  Creating sample categories...\n')
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .upsert(sampleCategories, { onConflict: 'name' })
    .select()
  
  if (categoriesError) {
    console.error('❌ Error creating categories:', categoriesError)
    process.exit(1)
  }
  
  process.stdout.write(`✅ Created ${categories.length} sample categories\n`)
  
  // Create tags
  process.stdout.write('🏷️  Creating sample tags...\n')
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .upsert(sampleTags, { onConflict: 'name' })
    .select()
  
  if (tagsError) {
    console.error('❌ Error creating tags:', tagsError)
    process.exit(1)
  }
  
  process.stdout.write(`✅ Created ${tags.length} sample tags\n`)
  
  // Create products with tags
  await createSampleProducts(categories, tags)
  
  // Create admin user
  await createAdminUser()
  
  process.stdout.write('✅ Sample data seeding complete!\n')
  process.exit(0)
}

// Run the main function
main().catch(error => {
  console.error('❌ Script execution failed:', error)
  process.exit(1)
}) 