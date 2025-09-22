-- Migrate Existing Users to BetterAuth Format
-- This script moves data from existing 'users' table to BetterAuth 'user' table
-- Date: 2025-09-20

-- Insert existing users into BetterAuth user table
INSERT INTO "user" (
  "id",
  "name", 
  "email",
  "emailVerified",
  "image",
  "createdAt",
  "updatedAt"
)
SELECT 
  u.id,
  COALESCE(u.name, u.email) as name, -- Use email as name if name is null
  u.email,
  true as "emailVerified", -- Assume existing users have verified emails
  null as image, -- No existing image field
  u.created_at as "createdAt",
  COALESCE(u.updated_at, u.created_at) as "updatedAt"
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "user" ba WHERE ba.id = u.id
);

-- Verify migration
SELECT 
  (SELECT COUNT(*) FROM "users") as original_users_count,
  (SELECT COUNT(*) FROM "user") as betterauth_users_count,
  (SELECT COUNT(*) FROM "users" u WHERE EXISTS (SELECT 1 FROM "user" ba WHERE ba.id = u.id)) as migrated_users_count;

-- Show sample of migrated data
SELECT 
  id,
  name,
  email,
  "emailVerified",
  "createdAt"
FROM "user" 
ORDER BY "createdAt" DESC
LIMIT 5;
