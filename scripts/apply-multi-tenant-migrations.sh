#!/bin/bash

# Multi-Tenant Architecture Migration Script
# This script applies the multi-tenant database migrations in the correct order

set -e  # Exit on error

echo "=================================="
echo "Multi-Tenant Migration Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Get project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATION_DIR="$PROJECT_DIR/supabase/migrations"

echo -e "${YELLOW}Project Directory: $PROJECT_DIR${NC}"
echo -e "${YELLOW}Migration Directory: $MIGRATION_DIR${NC}"
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATION_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found at $MIGRATION_DIR${NC}"
    exit 1
fi

# Check if migration files exist
MIGRATION_1="$MIGRATION_DIR/020_multi_tenant_calendar_architecture.sql"
MIGRATION_2="$MIGRATION_DIR/021_update_stripe_metadata_fields.sql"

if [ ! -f "$MIGRATION_1" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_1${NC}"
    exit 1
fi

if [ ! -f "$MIGRATION_2" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_2${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All migration files found${NC}"
echo ""

# Warning
echo -e "${RED}⚠️  WARNING: This will modify your database schema${NC}"
echo -e "${RED}⚠️  Make sure you have a backup before proceeding!${NC}"
echo ""
read -p "Have you backed up your database? (yes/no): " backup_confirm

if [ "$backup_confirm" != "yes" ]; then
    echo -e "${YELLOW}Please backup your database first!${NC}"
    echo "You can create a backup with:"
    echo "  supabase db dump -f backup-\$(date +%Y%m%d).sql"
    exit 0
fi

echo ""
echo "=================================="
echo "Applying Migrations"
echo "=================================="
echo ""

# Apply Migration 1: Calendar Architecture
echo -e "${YELLOW}Applying Migration 1: Calendar Architecture...${NC}"
if supabase db execute -f "$MIGRATION_1"; then
    echo -e "${GREEN}✓ Migration 1 applied successfully${NC}"
else
    echo -e "${RED}✗ Migration 1 failed${NC}"
    exit 1
fi

echo ""

# Apply Migration 2: Stripe Metadata
echo -e "${YELLOW}Applying Migration 2: Stripe Metadata...${NC}"
if supabase db execute -f "$MIGRATION_2"; then
    echo -e "${GREEN}✓ Migration 2 applied successfully${NC}"
else
    echo -e "${RED}✗ Migration 2 failed${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "Verifying Migrations"
echo "=================================="
echo ""

# Verification queries
VERIFY_QUERY="
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('venue_calendars', 'game_calendars', 'stripe_sync_log');
"

echo "Checking if new tables were created..."
TABLE_COUNT=$(supabase db execute --output csv -c "$VERIFY_QUERY" | tail -1)

if [ "$TABLE_COUNT" -eq "3" ]; then
    echo -e "${GREEN}✓ All 3 new tables created successfully${NC}"
else
    echo -e "${RED}✗ Expected 3 tables, found $TABLE_COUNT${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "Post-Migration Setup"
echo "=================================="
echo ""

read -p "Do you want to create default calendars for existing venues? (yes/no): " create_calendars

if [ "$create_calendars" == "yes" ]; then
    echo -e "${YELLOW}Creating default venue calendars...${NC}"
    
    CALENDAR_QUERY="
    INSERT INTO venue_calendars (
      organization_id,
      venue_id,
      name,
      slug,
      is_default,
      is_active
    )
    SELECT 
      v.organization_id,
      v.id as venue_id,
      v.name || ' - Main Calendar' as name,
      'main' as slug,
      true as is_default,
      true as is_active
    FROM venues v
    WHERE NOT EXISTS (
      SELECT 1 FROM venue_calendars vc 
      WHERE vc.venue_id = v.id AND vc.is_default = true
    );
    "
    
    if supabase db execute -c "$CALENDAR_QUERY"; then
        echo -e "${GREEN}✓ Default calendars created${NC}"
    else
        echo -e "${YELLOW}⚠ Calendar creation had issues (may already exist)${NC}"
    fi
fi

echo ""
read -p "Do you want to backfill denormalized name fields? (yes/no): " backfill_names

if [ "$backfill_names" == "yes" ]; then
    echo -e "${YELLOW}Backfilling denormalized fields...${NC}"
    
    BACKFILL_QUERY="
    -- Update bookings
    UPDATE bookings b
    SET 
      organization_name = o.name,
      venue_name = v.name,
      game_name = g.name
    FROM organizations o, venues v, games g
    WHERE b.organization_id = o.id
      AND b.venue_id = v.id
      AND b.game_id = g.id
      AND (b.organization_name IS NULL 
        OR b.venue_name IS NULL 
        OR b.game_name IS NULL);

    -- Update games
    UPDATE games g
    SET 
      organization_name = o.name,
      venue_name = v.name
    FROM organizations o, venues v
    WHERE g.organization_id = o.id
      AND g.venue_id = v.id
      AND (g.organization_name IS NULL 
        OR g.venue_name IS NULL);
    "
    
    if supabase db execute -c "$BACKFILL_QUERY"; then
        echo -e "${GREEN}✓ Denormalized fields backfilled${NC}"
    else
        echo -e "${YELLOW}⚠ Backfill had issues${NC}"
    fi
fi

echo ""
echo "=================================="
echo "Migration Complete! 🎉"
echo "=================================="
echo ""
echo -e "${GREEN}✓ Multi-tenant architecture deployed successfully${NC}"
echo ""
echo "Next steps:"
echo "1. Test creating a new venue (calendar should auto-create)"
echo "2. Test creating a new game (should include metadata in Stripe)"
echo "3. Test booking creation (names should auto-populate)"
echo "4. Verify RLS policies are working"
echo ""
echo "For detailed testing, see: DEPLOYMENT_GUIDE_MULTI_TENANT.md"
echo ""

