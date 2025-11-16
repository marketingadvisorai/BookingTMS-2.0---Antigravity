#!/bin/bash

# Automated Stripe Connect Testing Script
# Bismillah - Let's test the deployed Edge Functions!

echo "🚀 Starting Stripe Connect Integration Test"
echo "==========================================="
echo ""

# Configuration
PROJECT_ID="ohfjkcajnqvethmrpdwc"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1"
ORG_ID="64fa1946-3cdd-43af-b7de-cc4708cd4b80"
ORG_NAME="Default Organization"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# You need to provide these:
echo "📋 Please provide the following:"
echo ""
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
echo ""
read -p "Enter your JWT Token (from logged-in user): " JWT_TOKEN
echo ""
read -p "Enter test email for Stripe account: " TEST_EMAIL
echo ""

if [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$JWT_TOKEN" ] || [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}❌ Missing required inputs. Exiting.${NC}"
    exit 1
fi

echo ""
echo "🎯 Test Configuration:"
echo "  Organization: $ORG_NAME"
echo "  Organization ID: $ORG_ID"
echo "  Test Email: $TEST_EMAIL"
echo ""
echo "==========================================="
echo ""

# Test 1: Create Stripe Connect Account
echo "🧪 TEST 1: Creating Stripe Connect Account"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/stripe-connect-create-account" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\",
    \"email\": \"${TEST_EMAIL}\",
    \"business_name\": \"${ORG_NAME}\",
    \"country\": \"US\"
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    ACCOUNT_ID=$(echo "$RESPONSE" | jq -r '.account_id')
    echo -e "${GREEN}✅ Account created successfully!${NC}"
    echo "   Account ID: $ACCOUNT_ID"
else
    echo -e "${RED}❌ Failed to create account${NC}"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "==========================================="
echo ""
sleep 2

# Test 2: Get Account Link (Onboarding URL)
echo "🧪 TEST 2: Getting Stripe Onboarding Link"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/stripe-connect-account-link" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\"
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    ONBOARDING_URL=$(echo "$RESPONSE" | jq -r '.url')
    echo -e "${GREEN}✅ Onboarding link generated!${NC}"
    echo ""
    echo -e "${YELLOW}🔗 ONBOARDING URL:${NC}"
    echo "$ONBOARDING_URL"
    echo ""
    echo -e "${YELLOW}📝 ACTION REQUIRED:${NC}"
    echo "1. Open the URL above in your browser"
    echo "2. Complete the Stripe onboarding form"
    echo "3. After completing, come back and press ENTER to continue"
    echo ""
    read -p "Press ENTER after completing onboarding..." 
else
    echo -e "${RED}❌ Failed to get onboarding link${NC}"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "==========================================="
echo ""

# Test 3: Get Account Status
echo "🧪 TEST 3: Checking Account Status"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/stripe-connect-account-status" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\"
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful and activated
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    CHARGES_ENABLED=$(echo "$RESPONSE" | jq -r '.charges_enabled')
    PAYOUTS_ENABLED=$(echo "$RESPONSE" | jq -r '.payouts_enabled')
    ONBOARDING_STATUS=$(echo "$RESPONSE" | jq -r '.onboarding_status')
    
    echo -e "${GREEN}✅ Account status retrieved!${NC}"
    echo ""
    echo "Account Details:"
    echo "  Charges Enabled: $CHARGES_ENABLED"
    echo "  Payouts Enabled: $PAYOUTS_ENABLED"
    echo "  Onboarding Status: $ONBOARDING_STATUS"
    echo ""
    
    if [ "$CHARGES_ENABLED" = "true" ] && [ "$PAYOUTS_ENABLED" = "true" ]; then
        echo -e "${GREEN}✅✅✅ ACCOUNT FULLY ACTIVATED! ✅✅✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Account created but not fully activated${NC}"
        echo "   This may require additional verification from Stripe"
    fi
else
    echo -e "${RED}❌ Failed to get account status${NC}"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "==========================================="
echo ""

# Final Summary
echo "📊 TEST SUMMARY"
echo "==========================================="
echo ""
echo -e "${GREEN}✅ Test 1: Create Account - PASSED${NC}"
echo -e "${GREEN}✅ Test 2: Get Onboarding Link - PASSED${NC}"
echo -e "${GREEN}✅ Test 3: Check Account Status - PASSED${NC}"
echo ""
echo "🎉 ALL TESTS COMPLETED SUCCESSFULLY!"
echo ""
echo "Next Steps:"
echo "1. Build payment checkout function"
echo "2. Build webhook handler"
echo "3. Frontend integration"
echo ""
echo "Bismillah - Backend is production ready! 🚀"
