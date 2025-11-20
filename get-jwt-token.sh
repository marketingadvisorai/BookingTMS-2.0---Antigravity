#!/bin/bash

# Get JWT Token for Testing
# Bismillah!

echo "🔑 Getting JWT Token..."
echo "========================"
echo ""

# Configuration
PROJECT_ID="ohfjkcajnqvethmrpdwc"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmprY2FqbnF2ZXRobXJwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDE2OTEsImV4cCI6MjA3Nzc3NzY5MX0.EkzMR6RP3YiVNASU3Ppq4KiJHCP8R8lY4yQxKhs_4e8"

# User credentials
EMAIL="testadmin@test.com"

echo "User Email: $EMAIL"
echo ""
read -sp "Enter password for $EMAIL: " PASSWORD
echo ""
echo ""

echo "🔐 Authenticating..."

RESPONSE=$(curl -s -X POST \
  "https://${PROJECT_ID}.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

# Check if successful
if echo "$RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    JWT_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
    
    echo "✅ Success! JWT Token obtained!"
    echo ""
    echo "================================"
    echo "YOUR JWT TOKEN:"
    echo "================================"
    echo "$JWT_TOKEN"
    echo ""
    echo "================================"
    echo "User ID: $USER_ID"
    echo "================================"
    echo ""
    
    # Save to file for easy access
    echo "$JWT_TOKEN" > .jwt-token.txt
    echo ""
    echo "✅ Token saved to: .jwt-token.txt"
    echo ""
    echo "🚀 Now you can run the test:"
    echo "   ./AUTOMATED_TEST_SCRIPT.sh"
    echo ""
    
else
    echo "❌ Authentication failed!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "Please check:"
    echo "1. Email is correct: $EMAIL"
    echo "2. Password is correct"
    echo "3. User exists in Supabase Auth"
    exit 1
fi
