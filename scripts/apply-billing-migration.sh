#!/bin/bash
# Apply billing migration to Supabase
# Run: ./scripts/apply-billing-migration.sh

echo "Applying billing migration..."

# Read the migration file and execute via Supabase SQL Editor
# You can also use psql if you have the connection string

MIGRATION_FILE="supabase/migrations/084_billing_subscription_system.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Migration file found: $MIGRATION_FILE"
echo ""
echo "To apply this migration:"
echo "1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/qftjyjpitnoapqxlrvfs/sql"
echo "2. Copy and paste the contents of $MIGRATION_FILE"
echo "3. Click 'Run'"
echo ""
echo "Or use psql:"
echo "psql 'postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres' -f $MIGRATION_FILE"
echo ""
echo "Done!"
