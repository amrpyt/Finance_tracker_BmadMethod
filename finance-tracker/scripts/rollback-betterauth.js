#!/usr/bin/env node

/**
 * BetterAuth Rollback Script
 * Removes BetterAuth tables and restores original state
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('⚠️  BetterAuth Rollback Script');
    console.log('This will remove all BetterAuth tables and data.\n');

    const confirm = await askQuestion('Are you sure you want to proceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Rollback cancelled.');
      return;
    }

    console.log('\n🔄 Running rollback...');

    const rollbackSql = fs.readFileSync(
      path.join(__dirname, 'migrations', '999-rollback-betterauth.sql'),
      'utf8'
    );

    await pool.query(rollbackSql);

    console.log('✅ Rollback completed successfully!');
    console.log('\nBetterAuth tables have been removed.');
    console.log('Original users table remains intact.');

  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
