-- Backup Existing Users Data
-- Run this before applying BetterAuth migration to preserve existing user data
-- Date: 2025-09-20

-- Create backup table for existing users
CREATE TABLE IF NOT EXISTS "users_backup" AS SELECT * FROM "users";

-- Verify backup
SELECT 
  COUNT(*) as total_users_backed_up,
  MIN(created_at) as earliest_user,
  MAX(created_at) as latest_user
FROM "users_backup";

-- Show sample of backed up data (excluding sensitive info)
SELECT 
  id,
  email,
  created_at,
  'REDACTED' as password_hash
FROM "users_backup" 
LIMIT 5;
