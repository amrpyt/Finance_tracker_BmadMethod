#!/usr/bin/env node

/**
 * BetterAuth Migration Script
 * Runs database migrations for BetterAuth integration
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration(filePath, description) {
  try {
    console.log(`\n🔄 Running: ${description}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    const result = await pool.query(sql);
    console.log(`✅ Completed: ${description}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting BetterAuth Migration...\n');

    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Step 1: Backup existing users
    await runMigration(
      path.join(migrationsDir, '000-backup-existing-users.sql'),
      'Backing up existing users'
    );

    // Step 2: Create BetterAuth tables
    await runMigration(
      path.join(migrationsDir, '001-create-betterauth-tables.sql'),
      'Creating BetterAuth tables'
    );

    // Step 3: Migrate existing users
    await runMigration(
      path.join(migrationsDir, '002-migrate-existing-users.sql'),
      'Migrating existing users to BetterAuth format'
    );

    console.log('\n🎉 BetterAuth migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test BetterAuth configuration');
    console.log('2. Update application code to use BetterAuth');
    console.log('3. Test authentication flows');
    console.log('4. Remove legacy authentication code');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.log('\n🔄 To rollback, run:');
    console.log('node scripts/rollback-betterauth.js');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { runMigration };
