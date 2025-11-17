#!/bin/bash

# Stripe Connect Integration Installation Script
# Run this script to install all dependencies for Stripe Connect

echo "🚀 Installing Stripe Connect Dependencies..."
echo ""

# Backend dependencies
echo "📦 Installing backend packages..."
cd src/backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Backend package.json not found. Please run this from project root."
  exit 1
fi

# Install runtime dependencies
npm install stripe express express-validator cors helmet compression express-rate-limit

# Install dev dependencies
npm install --save-dev @types/express @types/node @types/cors

echo "✅ Backend dependencies installed"
echo ""

# Return to root
cd ../..

# Frontend - no additional deps needed (using existing packages)
echo "✅ Frontend dependencies already configured"
echo ""

# Database migration
echo "📊 Database migration ready at:"
echo "   supabase/migrations/20241117_stripe_connect_accounts.sql"
echo ""
echo "   Run: supabase db push"
echo "   Or apply manually in Supabase dashboard"
echo ""

# Environment variables check
echo "🔐 Environment Variables Required:"
echo ""
echo "Add to .env.backend:"
echo "-------------------"
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo "API_BASE_URL=http://localhost:3001"
echo ""

echo "Add to .env (frontend):"
echo "----------------------"
echo "VITE_BACKEND_API_URL=http://localhost:3001"
echo ""

echo "✅ Installation complete!"
echo ""
echo "📚 Next steps:"
echo "1. Configure environment variables (see above)"
echo "2. Run database migration: supabase db push"
echo "3. Start backend: cd src/backend && npm run dev"
echo "4. Start frontend: npm run dev"
echo ""
echo "📖 Full documentation: STRIPE_CONNECT_SETUP_GUIDE.md"
