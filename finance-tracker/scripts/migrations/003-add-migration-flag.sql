-- Add Migration Flag to Legacy Users Table
-- This allows tracking which users have been migrated to BetterAuth
-- Date: 2025-09-20

-- Add migration tracking column to legacy users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "migrated_to_betterauth" BOOLEAN DEFAULT FALSE;

-- Add index for migration queries
CREATE INDEX IF NOT EXISTS "users_migration_flag_idx" ON "users"("migrated_to_betterauth");

-- Update any existing migrated users (based on presence in BetterAuth user table)
UPDATE "users" 
SET "migrated_to_betterauth" = TRUE 
WHERE EXISTS (
  SELECT 1 FROM "user" ba WHERE ba.id = "users".id
);

-- Verify migration flag setup
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE migrated_to_betterauth = TRUE) as migrated_users,
  COUNT(*) FILTER (WHERE migrated_to_betterauth = FALSE) as pending_migration
FROM "users";
