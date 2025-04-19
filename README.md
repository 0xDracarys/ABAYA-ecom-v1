# ABAYA E-commerce Platform

A modern e-commerce platform built with Next.js, Supabase, and Stripe.

## Features

- Responsive design with Tailwind CSS
- User authentication with Supabase
- Shopping cart functionality with Redux
- Payment processing with Stripe
- Admin dashboard for product management
- Order tracking and history
- Automatic port conflict detection and resolution
- Comprehensive testing suite (Unit, Integration, E2E)

## Tech Stack

- Next.js 14 (App Router)
- Supabase for database and authentication
- Redux Toolkit for state management
- Tailwind CSS for styling
- Shadcn UI components
- Stripe for payment processing
- Jest for unit and integration testing
- Playwright for E2E testing

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
   npm run supabase:setup
   ```

5. Run the development server:
   ```
   npm run dev
   ```
   
   Or use the port-safe version that automatically resolves port conflicts:
   ```
   npm run dev:safe
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Unit and Integration Tests
```
npm test
npm run test:coverage
```

### E2E Tests
```
npm run test:e2e
```

## Production Deployment

To create a production build:
```
npm run production
```

This will build the application and start it in production mode with automatic port handling.

## Project Structure

```
ABAYA-ecom-v1/
├── app/              # Next.js App Router pages
├── components/       # Reusable components
├── e2e/              # End-to-end tests with Playwright
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── public/           # Static assets
├── redux/            # Redux store and slices
├── scripts/          # Setup scripts
├── styles/           # Global styles
└── __tests__/        # Jest tests (unit/integration)
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.