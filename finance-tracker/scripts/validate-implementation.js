#!/usr/bin/env node

/**
 * Implementation Validation Script
 * Validates BetterAuth migration implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BetterAuth Implementation Validation\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function validateFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: Found`);
    results.passed++;
    return true;
  } else {
    console.log(`❌ ${description}: Missing - ${filePath}`);
    results.failed++;
    results.issues.push(`Missing file: ${filePath}`);
    return false;
  }
}

function validateFileContent(filePath, searchText, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${description}: File not found - ${filePath}`);
    results.failed++;
    results.issues.push(`File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(searchText)) {
    console.log(`✅ ${description}: Validated`);
    results.passed++;
    return true;
  } else {
    console.log(`⚠️  ${description}: Content not found - ${searchText}`);
    results.warnings++;
    results.issues.push(`Content validation failed in ${filePath}: ${searchText}`);
    return false;
  }
}

function validatePackageJson() {
  console.log('\n📦 Package Dependencies Validation:');
  
  const packagePath = path.join(__dirname, '../package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found');
    results.failed++;
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'better-auth',
    'pg', 
    '@types/pg',
    'bcryptjs',
    'jsonwebtoken',
    'dotenv'
  ];

  const requiredDevDeps = [
    '@better-auth/cli'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ Dependency: ${dep} v${packageJson.dependencies[dep]}`);
      results.passed++;
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
      results.failed++;
      results.issues.push(`Missing dependency: ${dep}`);
    }
  });

  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ Dev Dependency: ${dep} v${packageJson.devDependencies[dep]}`);
      results.passed++;
    } else {
      console.log(`❌ Missing dev dependency: ${dep}`);
      results.failed++;
      results.issues.push(`Missing dev dependency: ${dep}`);
    }
  });
}

function validateEnvironment() {
  console.log('\n🌍 Environment Configuration Validation:');
  
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');
  
  validateFile(envPath, 'Environment file (.env)');
  validateFile(envExamplePath, 'Environment template (.env.example)');
  
  if (fs.existsSync(envPath)) {
    validateFileContent(envPath, 'BETTER_AUTH_SECRET=', 'BetterAuth secret configuration');
    validateFileContent(envPath, 'BETTER_AUTH_URL=', 'BetterAuth URL configuration');
    validateFileContent(envPath, 'DATABASE_URL=', 'Database URL configuration');
  }
}

function validateMigrationScripts() {
  console.log('\n📊 Migration Scripts Validation:');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const requiredMigrations = [
    '000-backup-existing-users.sql',
    '001-create-betterauth-tables.sql', 
    '002-migrate-existing-users.sql',
    '003-add-migration-flag.sql',
    '999-rollback-betterauth.sql'
  ];

  requiredMigrations.forEach(migration => {
    validateFile(path.join(migrationsDir, migration), `Migration: ${migration}`);
  });

  // Validate migration runner scripts
  validateFile(path.join(__dirname, 'migrate-betterauth.js'), 'Migration runner script');
  validateFile(path.join(__dirname, 'rollback-betterauth.js'), 'Rollback runner script');
  validateFile(path.join(__dirname, 'validate-migration.js'), 'Migration validation script');
}

function validateAuthSystem() {
  console.log('\n🔐 Authentication System Validation:');
  
  const srcDir = path.join(__dirname, '../src');
  
  // Core auth files
  validateFile(path.join(srcDir, 'lib/auth-betterauth.ts'), 'BetterAuth configuration');
  validateFile(path.join(srcDir, 'lib/auth-dual.ts'), 'Dual authentication system');
  validateFile(path.join(srcDir, 'lib/auth-migration.ts'), 'Migration utilities');
  validateFile(path.join(srcDir, 'lib/auth.ts'), 'Legacy auth utilities');

  // API routes
  const apiAuthDir = path.join(srcDir, 'app/api/auth');
  validateFile(path.join(apiAuthDir, '[...better-auth]/route.ts'), 'BetterAuth API handler');
  validateFile(path.join(apiAuthDir, 'signup/route.ts'), 'Signup endpoint');
  validateFile(path.join(apiAuthDir, 'login/route.ts'), 'Login endpoint');
  validateFile(path.join(apiAuthDir, 'logout/route.ts'), 'Logout endpoint');
  validateFile(path.join(apiAuthDir, 'me/route.ts'), 'User info endpoint');
  validateFile(path.join(apiAuthDir, 'test-betterauth/route.ts'), 'Test endpoint');

  // Validate dual auth integration
  validateFileContent(
    path.join(apiAuthDir, 'signup/route.ts'), 
    'signUpUser', 
    'Signup route uses dual auth system'
  );
  
  validateFileContent(
    path.join(apiAuthDir, 'me/route.ts'), 
    'getAuthContext', 
    'User info route uses dual auth context'
  );
}

function validateTestSuite() {
  console.log('\n🧪 Test Suite Validation:');
  
  const testsDir = path.join(__dirname, '../src/__tests__/auth');
  validateFile(path.join(testsDir, 'betterauth-setup.test.ts'), 'BetterAuth setup tests');
  validateFile(path.join(testsDir, 'backend-auth-replacement.test.ts'), 'Backend auth tests');
}

function validateStoryDocumentation() {
  console.log('\n📚 Story Documentation Validation:');
  
  const storiesDir = path.join(__dirname, '../../docs/stories');
  validateFile(path.join(storiesDir, '2.1.betterauth-setup.story.md'), 'Story 2.1 documentation');
  validateFile(path.join(storiesDir, '2.2.backend-auth-replacement.story.md'), 'Story 2.2 documentation');
  
  // Validate story completion status
  const story21Path = path.join(storiesDir, '2.1.betterauth-setup.story.md');
  const story22Path = path.join(storiesDir, '2.2.backend-auth-replacement.story.md');
  
  if (fs.existsSync(story21Path)) {
    validateFileContent(story21Path, 'Ready for Review', 'Story 2.1 completion status');
  }
  
  if (fs.existsSync(story22Path)) {
    validateFileContent(story22Path, 'Ready for Review', 'Story 2.2 completion status');
  }
}

// Run all validations
async function runValidation() {
  validatePackageJson();
  validateEnvironment();
  validateMigrationScripts();
  validateAuthSystem();
  validateTestSuite();
  validateStoryDocumentation();

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  const total = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / total) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);

  if (results.issues.length > 0) {
    console.log('\n🔍 Issues Found:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n🎉 All critical validations passed! Implementation is ready.');
    return true;
  } else {
    console.log('\n⚠️  Some validations failed. Please review the issues above.');
    return false;
  }
}

if (require.main === module) {
  runValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = runValidation;
