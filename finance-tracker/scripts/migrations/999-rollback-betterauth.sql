-- Rollback BetterAuth Migration
-- WARNING: This will remove all BetterAuth tables and data
-- Date: 2025-09-20

-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_updated_at ON "user";
DROP TRIGGER IF EXISTS update_session_updated_at ON "session";
DROP TRIGGER IF EXISTS update_account_updated_at ON "account";
DROP TRIGGER IF EXISTS update_verification_updated_at ON "verification";

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS "session_userId_idx";
DROP INDEX IF EXISTS "session_token_idx";
DROP INDEX IF EXISTS "account_userId_idx";
DROP INDEX IF EXISTS "account_providerId_idx";
DROP INDEX IF EXISTS "verification_identifier_idx";

-- Drop BetterAuth tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS "verification";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "user";

-- Optional: Restore original users table if needed
-- UNCOMMENT ONLY IF YOU NEED TO RESTORE ORIGINAL DATA:
-- DROP TABLE IF EXISTS "users";
-- ALTER TABLE "users_backup" RENAME TO "users";

SELECT 'BetterAuth tables removed successfully' as status;
