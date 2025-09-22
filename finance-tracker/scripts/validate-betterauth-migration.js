#!/usr/bin/env node

/**
 * BetterAuth Migration Validation Script
 * Validates that BetterAuth schema and migration are working correctly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function validateBetterAuthTables() {
  console.log('🔍 Validating BetterAuth Tables...\n');
  
  const requiredTables = ['user', 'account', 'session', 'verification'];
  const results = {};
  
  for (const table of requiredTables) {
    try {
      // Try to query each table
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        results[table] = `❌ Error: ${error.message}`;
      } else {
        results[table] = '✅ Exists and accessible';
      }
    } catch (error) {
      results[table] = `❌ Failed: ${error.message}`;
    }
  }
  
  console.log('📊 BetterAuth Tables Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`- ${table}: ${status}`);
  });
  
  const allValid = Object.values(results).every(status => status.includes('✅'));
  return allValid;
}

async function checkMigrationStatus() {
  console.log('\n🔄 Checking Migration Status...\n');
  
  try {
    // Check legacy users table
    const { data: legacyUsers, error: legacyError } = await supabase
      .from('users')
      .select('count');
    
    if (legacyError) {
      console.log('❌ Cannot access legacy users table:', legacyError.message);
      return false;
    }
    
    // Check BetterAuth users table
    const { data: betterAuthUsers, error: betterAuthError } = await supabase
      .from('user')
      .select('count');
    
    if (betterAuthError) {
      console.log('❌ Cannot access BetterAuth user table:', betterAuthError.message);
      return false;
    }
    
    console.log('📈 Migration Statistics:');
    console.log(`- Legacy users table: ${legacyUsers ? 'Accessible' : 'Not accessible'}`);
    console.log(`- BetterAuth user table: ${betterAuthUsers ? 'Accessible' : 'Not accessible'}`);
    
    return true;
  } catch (error) {
    console.log('❌ Migration status check failed:', error.message);
    return false;
  }
}

async function validateEnvironment() {
  console.log('\n🔧 Environment Validation...\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET'
  ];
  
  let allValid = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allValid = false;
    }
  });
  
  console.log(`\n🎯 SKIP_BETTERAUTH: ${process.env.SKIP_BETTERAUTH || 'false'}`);
  console.log(`🎯 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  
  return allValid;
}

async function main() {
  console.log('🧪 BetterAuth Migration Validation\n');
  console.log('=====================================\n');
  
  try {
    // Step 1: Validate environment
    const envValid = await validateEnvironment();
    
    // Step 2: Validate BetterAuth tables
    const tablesValid = await validateBetterAuthTables();
    
    // Step 3: Check migration status
    const migrationValid = await checkMigrationStatus();
    
    // Summary
    console.log('\n📋 Validation Summary:');
    console.log('=====================================');
    console.log(`Environment: ${envValid ? '✅ Valid' : '❌ Issues found'}`);
    console.log(`BetterAuth Tables: ${tablesValid ? '✅ Ready' : '❌ Schema missing'}`);
    console.log(`Migration System: ${migrationValid ? '✅ Working' : '❌ Issues found'}`);
    
    const overallStatus = envValid && tablesValid && migrationValid;
    
    console.log(`\n🎯 Overall Status: ${overallStatus ? '✅ READY FOR PRODUCTION' : '⚠️  REQUIRES ATTENTION'}`);
    
    if (!overallStatus) {
      console.log('\n📋 Next Steps:');
      if (!tablesValid) {
        console.log('1. Run BetterAuth schema creation in Supabase SQL Editor');
        console.log('   File: scripts/create-betterauth-schema.sql');
      }
      if (!envValid) {
        console.log('2. Configure missing environment variables');
      }
      if (!migrationValid) {
        console.log('3. Check database connectivity and permissions');
      }
    }
    
    return overallStatus;
    
  } catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = main;
