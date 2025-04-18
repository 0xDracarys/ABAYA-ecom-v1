# ABAYA E-commerce Platform

A modern e-commerce platform built with Next.js, Supabase, and Stripe.

## Features

- Responsive design with Tailwind CSS
- User authentication with Supabase
- Shopping cart functionality with Redux
- Payment processing with Stripe
- Admin dashboard for product management
- Order tracking and history

## Tech Stack

- Next.js 13 (App Router)
- Supabase for database and authentication
- Redux Toolkit for state management
- Tailwind CSS for styling
- Shadcn UI components
- Stripe for payment processing

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ABAYA-ecom-v1.git
   cd ABAYA-ecom-v1
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Set up the database:
   ```
   node scripts/setup-supabase.js
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ABAYA-ecom-v1/
├── app/
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   ├── admin/       # Admin dashboard
│   ├── cart/        # Shopping cart
│   ├── checkout/    # Checkout process
│   ├── products/    # Product pages
│   └── ...          # Other pages
├── components/      # Reusable components
├── lib/             # Utility functions
├── public/          # Static assets
├── scripts/         # Setup scripts
├── store/           # Redux store configuration
└── ...              # Configuration files
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.