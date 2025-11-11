#!/bin/bash

# BookingTMS Backend - Render Deployment Script
# This script helps you deploy your backend to Render

set -e  # Exit on error

echo "🚀 BookingTMS Backend - Render Deployment"
echo "=========================================="
echo ""

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found!"
    echo "Installing Render CLI..."
    brew install render
    echo "✅ Render CLI installed"
else
    echo "✅ Render CLI found (version: $(render --version))"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Render CLI installed"
echo "2. ⏳ Checking Git status..."

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "backend-render-deploy" ]; then
    echo "⚠️  You're on branch: $CURRENT_BRANCH"
    echo "   Switching to backend-render-deploy..."
    git checkout backend-render-deploy
fi

echo "3. ✅ On branch: backend-render-deploy"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes"
    echo "   Committing changes..."
    git add -A
    git commit -m "chore: Pre-deployment commit"
fi

echo "4. ✅ No uncommitted changes"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin backend-render-deploy
echo "✅ Pushed to GitHub"

echo ""
echo "🔐 Next Steps - Manual Configuration Required:"
echo ""
echo "1. Login to Render CLI (if not already logged in):"
echo "   $ render login"
echo ""
echo "2. Go to Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "3. Create New Web Service:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Select branch: backend-render-deploy"
echo ""
echo "4. Configure Service:"
echo "   Name: bookingtms-backend-api"
echo "   Build Command: cd src/backend && npm install && npm run build"
echo "   Start Command: cd src/backend && npm start"
echo "   Plan: Free"
echo ""
echo "5. Add Environment Variables (REQUIRED):"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   (See RENDER_DEPLOYMENT_GUIDE.md for complete list)"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
echo "📚 Full documentation: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Repository is ready for deployment!"
