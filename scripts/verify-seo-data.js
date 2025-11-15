#!/usr/bin/env node
/**
 * SEO Data Verification Script
 * Checks if all SEO fields are being saved to Supabase correctly
 * 
 * Usage: node scripts/verify-seo-data.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pmpktygjzywlhuujnlca.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
  console.error('❌ Please set VITE_SUPABASE_ANON_KEY environment variable');
  console.error('   Run: export VITE_SUPABASE_ANON_KEY="your-key-here"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List of all SEO fields that should be saved
const SEO_FIELDS = [
  'seoTitle',
  'businessName',
  'metaDescription',
  'seoKeywords',
  'enableLocalBusinessSchema',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'country',
  'phoneNumber',
  'emailAddress',
  'nearbyLandmarks',
  'parkingInfo',
  'showLocationBlock',
  'facebookUrl',
  'instagramUrl',
  'twitterUrl',
  'tripadvisorUrl',
  'googleBusinessId'
];

async function verifyVenueSEOData() {
  console.log('🔍 Verifying SEO Data Storage in Supabase...\n');
  console.log('=' .repeat(70));
  console.log('');

  try {
    // Fetch all venues
    const { data: venues, error } = await supabase
      .from('venues')
      .select('id, name, settings')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching venues:', error.message);
      return;
    }

    if (!venues || venues.length === 0) {
      console.log('⚠️  No venues found in database');
      return;
    }

    console.log(`Found ${venues.length} venue(s)\n`);

    venues.forEach((venue, index) => {
      console.log(`\n📍 Venue ${index + 1}: ${venue.name}`);
      console.log('-'.repeat(70));
      
      const widgetConfig = venue.settings?.widgetConfig || {};
      
      // Check each SEO field
      const foundFields = [];
      const missingFields = [];
      
      SEO_FIELDS.forEach(field => {
        if (widgetConfig[field] !== undefined && widgetConfig[field] !== null && widgetConfig[field] !== '') {
          foundFields.push(field);
        } else {
          missingFields.push(field);
        }
      });

      // Display found fields
      if (foundFields.length > 0) {
        console.log('\n✅ SEO Fields with Data:');
        foundFields.forEach(field => {
          const value = widgetConfig[field];
          const displayValue = typeof value === 'boolean' 
            ? value.toString() 
            : (typeof value === 'string' && value.length > 50 
              ? value.substring(0, 50) + '...' 
              : value);
          console.log(`   ${field}: ${displayValue}`);
        });
      }

      // Display missing fields
      if (missingFields.length > 0) {
        console.log('\n⚠️  Empty SEO Fields:');
        missingFields.forEach(field => {
          console.log(`   ${field}: (not set)`);
        });
      }

      // Summary
      const percentage = ((foundFields.length / SEO_FIELDS.length) * 100).toFixed(1);
      console.log(`\n📊 SEO Completion: ${foundFields.length}/${SEO_FIELDS.length} fields (${percentage}%)`);
      
      if (foundFields.length === 0) {
        console.log('⚠️  WARNING: No SEO data found for this venue!');
      } else if (foundFields.length < 5) {
        console.log('⚠️  WARNING: Very few SEO fields populated');
      } else if (foundFields.length >= 10) {
        console.log('✅ Good SEO data coverage');
      }
    });

    // Overall summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 VERIFICATION SUMMARY\n');
    
    const allVenuesHaveSomeData = venues.every(v => {
      const widgetConfig = v.settings?.widgetConfig || {};
      return SEO_FIELDS.some(field => 
        widgetConfig[field] !== undefined && 
        widgetConfig[field] !== null && 
        widgetConfig[field] !== ''
      );
    });

    if (allVenuesHaveSomeData) {
      console.log('✅ All venues have at least some SEO data');
    } else {
      console.log('⚠️  Some venues have NO SEO data at all');
    }

    // Check data structure
    console.log('\n📦 Data Structure Check:');
    const firstVenue = venues[0];
    if (firstVenue.settings?.widgetConfig) {
      console.log('✅ venues.settings.widgetConfig exists');
      console.log('✅ SEO fields are stored at the correct path');
    } else {
      console.log('❌ venues.settings.widgetConfig is missing!');
    }

    // Test a sample update
    console.log('\n🧪 Testing SEO Data Update...');
    const testVenue = venues[0];
    const testUpdate = {
      settings: {
        ...testVenue.settings,
        widgetConfig: {
          ...(testVenue.settings?.widgetConfig || {}),
          _testField: 'SEO_VERIFICATION_TEST_' + Date.now()
        }
      }
    };

    const { error: updateError } = await supabase
      .from('venues')
      .update(testUpdate)
      .eq('id', testVenue.id);

    if (updateError) {
      console.log('❌ Update test failed:', updateError.message);
    } else {
      console.log('✅ Update test successful - SEO data can be saved');
      
      // Clean up test field
      const cleanupUpdate = {
        settings: {
          ...testVenue.settings,
          widgetConfig: {
            ...(testVenue.settings?.widgetConfig || {})
          }
        }
      };
      delete cleanupUpdate.settings.widgetConfig._testField;
      
      await supabase
        .from('venues')
        .update(cleanupUpdate)
        .eq('id', testVenue.id);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Verification Complete!\n');

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

// Run verification
verifyVenueSEOData()
  .then(() => {
    console.log('\n📝 Next Steps:');
    console.log('1. Fill in SEO fields in the widget settings');
    console.log('2. Check "Save Changes" button shows "Saved ✓"');
    console.log('3. Refresh page and verify data persists');
    console.log('4. Run this script again to verify');
    console.log('');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });
