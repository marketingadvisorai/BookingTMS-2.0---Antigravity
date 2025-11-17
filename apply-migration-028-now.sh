#!/bin/bash

# =====================================================
# APPLY MIGRATION 028 - QUICK SCRIPT
# =====================================================

set -e

echo "🚀 Applying Migration 028..."
echo ""

# Check if we can connect to Supabase
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI found"
    
    # Try to get project ref
    PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")
    
    if [ -n "$PROJECT_REF" ]; then
        echo "✓ Project: $PROJECT_REF"
        echo ""
        echo "📋 Applying migration via Supabase CLI..."
        echo ""
        
        # Apply migration using SQL execute
        supabase db execute --project-ref "$PROJECT_REF" --file supabase/migrations/028_fix_system_admin_functions.sql
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Migration 028 applied successfully!"
            echo ""
            echo "Next steps:"
            echo "1. Test System Admin Dashboard"
            echo "2. Verify organizations load"
            echo "3. Check metrics display"
            echo ""
        else
            echo ""
            echo "❌ Migration failed. Try manual application:"
            echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
            echo "2. Copy: supabase/migrations/028_fix_system_admin_functions.sql"
            echo "3. Paste and Run"
            echo ""
        fi
    else
        echo "⚠️  Project ref not found"
        echo ""
        echo "Manual application required:"
        echo "1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/sql"
        echo "2. Copy: supabase/migrations/028_fix_system_admin_functions.sql"
        echo "3. Paste and Run"
        echo ""
    fi
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "Manual application required:"
    echo "1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/sql"
    echo "2. Copy: supabase/migrations/028_fix_system_admin_functions.sql"
    echo "3. Paste and Run"
    echo ""
fi
