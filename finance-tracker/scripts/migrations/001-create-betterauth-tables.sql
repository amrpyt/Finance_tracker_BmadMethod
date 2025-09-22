-- BetterAuth Schema Migration
-- Generated for Finance Tracker BetterAuth Integration
-- Date: 2025-09-20

-- Create user table (extends existing users table)
CREATE TABLE IF NOT EXISTS "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" VARCHAR,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create session table for session management
CREATE TABLE IF NOT EXISTS "session" (
  "id" VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  "token" VARCHAR UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" VARCHAR,
  "userAgent" VARCHAR,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create account table for social login providers (future use)
CREATE TABLE IF NOT EXISTS "account" (
  "id" VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  "accountId" VARCHAR NOT NULL,
  "providerId" VARCHAR NOT NULL,
  "accessToken" VARCHAR,
  "refreshToken" VARCHAR,
  "idToken" VARCHAR,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" VARCHAR,
  "password" VARCHAR,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create verification table for email verification
CREATE TABLE IF NOT EXISTS "verification" (
  "id" VARCHAR PRIMARY KEY,
  "identifier" VARCHAR NOT NULL,
  "value" VARCHAR NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session"("token");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "account_providerId_idx" ON "account"("providerId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

-- Create updated_at triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "session" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "account" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON "verification" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
