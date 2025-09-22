#!/usr/bin/env node

/**
 * User Migration Validation Script
 * Validates user data migration from custom auth to BetterAuth
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function validateMigration() {
  try {
    console.log('🔍 Validating BetterAuth migration...\n');

    // Check table existence
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user', 'session', 'account', 'verification', 'users_backup')
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📊 Existing tables:', existingTables.join(', '));

    // Validate user counts
    const userCounts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as original_users,
        (SELECT COUNT(*) FROM "user") as betterauth_users,
        (SELECT COUNT(*) FROM users_backup) as backup_users
    `);
    
    const counts = userCounts.rows[0];
    console.log('\n👥 User Counts:');
    console.log(`   Original users: ${counts.original_users}`);
    console.log(`   BetterAuth users: ${counts.betterauth_users}`);
    console.log(`   Backup users: ${counts.backup_users}`);

    // Validate data integrity
    const integrityCheck = await pool.query(`
      SELECT 
        COUNT(*) as total_original,
        COUNT(ba.id) as migrated_count,
        COUNT(*) - COUNT(ba.id) as missing_count
      FROM users u
      LEFT JOIN "user" ba ON u.id = ba.id
    `);

    const integrity = integrityCheck.rows[0];
    console.log('\n🔒 Data Integrity:');
    console.log(`   Total original: ${integrity.total_original}`);
    console.log(`   Successfully migrated: ${integrity.migrated_count}`);
    console.log(`   Missing from BetterAuth: ${integrity.missing_count}`);

    // Sample data comparison
    const sampleComparison = await pool.query(`
      SELECT 
        u.id,
        u.email as original_email,
        ba.email as betterauth_email,
        u.created_at as original_created,
        ba."createdAt" as betterauth_created,
        CASE 
          WHEN u.email = ba.email THEN 'MATCH'
          ELSE 'MISMATCH'
        END as email_status
      FROM users u
      LEFT JOIN "user" ba ON u.id = ba.id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    console.log('\n📋 Sample Data Comparison:');
    sampleComparison.rows.forEach(row => {
      console.log(`   ${row.id.substring(0, 8)}... | ${row.email_status} | ${row.original_email}`);
    });

    // Migration success assessment
    const migrationRate = (parseInt(integrity.migrated_count) / parseInt(integrity.total_original)) * 100;
    const isSuccess = migrationRate >= 95;

    console.log('\n📈 Migration Assessment:');
    console.log(`   Migration Rate: ${migrationRate.toFixed(2)}%`);
    console.log(`   Status: ${isSuccess ? '✅ SUCCESS' : '⚠️  NEEDS ATTENTION'}`);

    if (!isSuccess) {
      console.log('\n⚠️  Migration Issues Detected:');
      if (integrity.missing_count > 0) {
        console.log(`   - ${integrity.missing_count} users not migrated`);
      }
      console.log('\n🔧 Recommended Actions:');
      console.log('   1. Review migration logs');
      console.log('   2. Re-run migration script');
      console.log('   3. Check for data consistency issues');
    } else {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n🔄 Next Steps:');
      console.log('   1. Test BetterAuth authentication endpoints');
      console.log('   2. Update frontend authentication code');
      console.log('   3. Perform user acceptance testing');
    }

    return isSuccess;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  validateMigration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = validateMigration;
