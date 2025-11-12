#!/bin/bash

# Stripe Integration Test Suite
# Enterprise-grade testing for backend API

echo "🧪 Testing Stripe Integration - Enterprise Grade"
echo "================================================"
echo ""

BACKEND_URL="https://bookingtms-backend-api.onrender.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        echo "  Response: $response"
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        echo "  Expected: $expected"
        echo "  Got: $response"
    fi
    echo ""
}

# Test 1: Backend Health
echo "📍 Test 1: Backend Health Check"
test_endpoint \
    "Health endpoint" \
    "$BACKEND_URL/health" \
    "healthy"

# Test 2: API Info
echo "📍 Test 2: API Information"
test_endpoint \
    "API info endpoint" \
    "$BACKEND_URL/api" \
    "BookingTMS API"

# Test 3: Stripe Config
echo "📍 Test 3: Stripe Public Config"
test_endpoint \
    "Stripe config endpoint" \
    "$BACKEND_URL/api/stripe/config" \
    "publishableKey"

# Test 4: Root endpoint
echo "📍 Test 4: Root Endpoint"
test_endpoint \
    "Root endpoint" \
    "$BACKEND_URL/" \
    "BookingTMS API Server"

# Summary
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo -e "✅ Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is ready.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check the logs above.${NC}"
    exit 1
fi
