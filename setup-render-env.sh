#!/bin/bash

# Render Environment Variables Setup Script
# Service: bookingtms-backend-api (srv-d49gml95pdvs73ctdb5g)

set -e

SERVICE_ID="srv-d49gml95pdvs73ctdb5g"

echo "🔐 Setting up environment variables for bookingtms-backend-api"
echo "================================================================"
echo ""

# Function to set environment variable
set_env() {
    local key=$1
    local value=$2
    local description=$3
    
    echo "Setting $key..."
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $key (no value provided)"
        echo "   $description"
        return
    fi
    
    # Note: Render CLI doesn't have direct env set command
    # We'll create a JSON file instead
    echo "✓ $key configured"
}

echo "📋 Required Environment Variables"
echo "=================================="
echo ""
echo "Please provide the following values:"
echo ""

# Supabase
read -p "SUPABASE_URL (e.g., https://xxx.supabase.co): " SUPABASE_URL
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY

# Stripe
read -p "STRIPE_SECRET_KEY (sk_test_ or sk_live_): " STRIPE_SECRET_KEY
read -p "STRIPE_PUBLISHABLE_KEY (pk_test_ or pk_live_): " STRIPE_PUBLISHABLE_KEY
read -p "STRIPE_WEBHOOK_SECRET (whsec_): " STRIPE_WEBHOOK_SECRET

# Frontend URL
read -p "Frontend URL (for CORS): " FRONTEND_URL

echo ""
echo "📝 Creating environment variables configuration..."
echo ""

# Create JSON configuration
cat > render-env-config.json << EOF
{
  "NODE_ENV": "production",
  "PORT": "3001",
  "API_BASE_URL": "https://bookingtms-backend-api.onrender.com",
  "SUPABASE_URL": "$SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY": "$SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY": "$STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY": "$STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET": "$STRIPE_WEBHOOK_SECRET",
  "ALLOWED_ORIGINS": "${FRONTEND_URL:-http://localhost:5173},http://localhost:5173",
  "SESSION_TIMEOUT": "3600000",
  "RATE_LIMIT_WINDOW_MS": "900000",
  "RATE_LIMIT_MAX_REQUESTS": "100"
}
EOF

echo "✅ Configuration file created: render-env-config.json"
echo ""
echo "📤 Next Steps:"
echo ""
echo "1. Go to Render Dashboard:"
echo "   https://dashboard.render.com/web/$SERVICE_ID/env"
echo ""
echo "2. Add these environment variables manually:"
echo "   (Copy from render-env-config.json)"
echo ""
echo "3. Generate these values in Render Dashboard:"
echo "   - JWT_SECRET (click 'Generate Value')"
echo "   - ENCRYPTION_KEY (click 'Generate Value')"
echo ""
echo "4. Optional: Add SendGrid, Twilio, OpenAI keys"
echo ""
echo "5. Click 'Save Changes' to deploy"
echo ""
echo "📊 Service Information:"
echo "   Service ID: $SERVICE_ID"
echo "   Service URL: https://bookingtms-backend-api.onrender.com"
echo "   Dashboard: https://dashboard.render.com/web/$SERVICE_ID"
echo ""
echo "✅ Configuration ready!"
