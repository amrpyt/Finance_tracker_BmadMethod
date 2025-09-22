#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests both direct PostgreSQL and Supabase client connections
 */

require('dotenv').config();

async function testDirectConnection() {
  console.log('🔍 Testing Direct PostgreSQL Connection...');
  
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Direct PostgreSQL connection successful!');
    console.log('📅 Server time:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Direct PostgreSQL connection failed:', error.message);
    return false;
  }
}

async function testSupabaseClient() {
  console.log('\n🔍 Testing Supabase Client Connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Supabase client error:', error.message);
      return false;
    }

    console.log('✅ Supabase client connection successful!');
    return true;
  } catch (error) {
    console.log('❌ Supabase client connection failed:', error.message);
    return false;
  }
}

async function testDNSResolution() {
  console.log('\n🔍 Testing DNS Resolution...');
  
  try {
    const dns = require('dns').promises;
    const hostname = 'db.wsornpngccfunbiijngg.supabase.co';
    
    const addresses = await dns.lookup(hostname);
    console.log('✅ DNS resolution successful!');
    console.log('🌐 Resolved IP:', addresses.address);
    return true;
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Database Connection Diagnostics\n');
  console.log('Environment Variables:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  const dnsOk = await testDNSResolution();
  const directOk = await testDirectConnection();
  const supabaseOk = await testSupabaseClient();

  console.log('\n📊 Connection Summary:');
  console.log(`DNS Resolution: ${dnsOk ? '✅' : '❌'}`);
  console.log(`Direct PostgreSQL: ${directOk ? '✅' : '❌'}`);
  console.log(`Supabase Client: ${supabaseOk ? '✅' : '❌'}`);

  if (supabaseOk || directOk) {
    console.log('\n🎉 At least one connection method works! Migration can proceed.');
    return true;
  } else {
    console.log('\n⚠️  No connection methods working. Check network/credentials.');
    return false;
  }
}

if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = main;
