# BetterAuth User Migration Strategy

## Overview
This document outlines the strategy for migrating existing users from the custom JWT authentication system to BetterAuth while preserving all user data and maintaining security.

## Current State Analysis
- **Current System**: Custom JWT with bcryptjs password hashing
- **User Table**: `users` table with `id`, `email`, `password_hash`, `created_at`
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Session Management**: HTTP-only cookies with 7-day JWT expiration

## BetterAuth Requirements
- **User Table**: `user` table with `id`, `name`, `email`, `emailVerified`, etc.
- **Password Hashing**: scrypt algorithm (native to BetterAuth)
- **Session Management**: Dedicated `session` table with tokens

## Migration Strategy

### Phase 1: Data Preservation
1. **Backup Existing Data**
   - Create `users_backup` table
   - Verify all user records are backed up
   - Document current user count and date ranges

2. **Schema Extension**
   - Create BetterAuth tables alongside existing tables
   - Maintain existing `users` table during transition
   - Use different table names to avoid conflicts

### Phase 2: User Data Migration
1. **User Profile Migration**
   - Map `users.id` → `user.id` (preserve UUIDs)
   - Map `users.email` → `user.email`
   - Use `users.email` as `user.name` (fallback)
   - Set `emailVerified = true` (existing users assumed verified)
   - Map `users.created_at` → `user.createdAt`

2. **Password Migration Strategy**
   - **Option A (Gradual)**: Keep bcrypt hashes, migrate on next login
   - **Option B (Immediate)**: Cannot migrate hashes directly (different algorithms)
   - **Chosen Strategy**: Gradual migration with dual authentication support

### Phase 3: Authentication Transition
1. **Dual Authentication Period**
   - Keep existing JWT endpoints functional
   - Add BetterAuth endpoints in parallel
   - Use feature flag to control which system is active

2. **Password Hash Migration**
   - On successful login with old system, migrate to BetterAuth
   - Store scrypt hash in BetterAuth tables
   - Mark user as "migrated" to avoid dual processing

### Phase 4: System Cutover
1. **Gradual Rollout**
   - Start with test users
   - Monitor error rates and performance
   - Gradually increase percentage of users

2. **Complete Migration**
   - Disable old JWT endpoints
   - Remove legacy authentication code
   - Clean up old tables (after safety period)

## Implementation Details

### Migration Script Features
- **Validation**: Verify all users migrated successfully
- **Rollback**: Complete rollback capability
- **Monitoring**: Log all migration steps
- **Safety Checks**: Prevent data loss

### Password Migration Logic
```typescript
// During login, check if user exists in both systems
if (userInOldSystem && !userInBetterAuth) {
  // Verify with bcrypt first
  if (bcrypt.compare(password, oldHash)) {
    // Create BetterAuth user with scrypt hash
    await betterAuth.createUser({
      id: user.id,
      email: user.email,
      password: password // BetterAuth will hash with scrypt
    });
  }
}
```

### Validation Steps
1. **Pre-Migration Checks**
   - Verify database connectivity
   - Check BetterAuth table creation
   - Validate environment variables

2. **Post-Migration Verification**
   - Compare user counts
   - Test sample user logins
   - Verify session creation

3. **Rollback Validation**
   - Test rollback script on copy
   - Verify data restoration
   - Document rollback time estimates

## Risk Mitigation

### Data Loss Prevention
- Complete backup before any changes
- Staged rollout approach
- Multiple validation checkpoints
- Automated testing of migration scripts

### Session Continuity
- Existing sessions remain valid during migration
- New logins create BetterAuth sessions
- Gradual session migration over time

### Performance Considerations
- Migration runs during low-traffic periods
- Progress monitoring and pause capability
- Database connection pooling
- Batch processing for large user sets

## Success Metrics
- **Data Integrity**: 100% user data preserved
- **Migration Rate**: >95% users migrated within 30 days
- **Performance**: No degradation in auth response times
- **Error Rate**: <1% authentication failures
- **Rollback Time**: <30 minutes if needed

## Timeline
- **Week 1**: Schema setup and initial migration
- **Week 2**: Dual authentication testing
- **Week 3**: Gradual rollout (10% → 50% → 100%)
- **Week 4**: Cleanup and monitoring

## Testing Strategy
- Unit tests for migration scripts
- Integration tests for dual authentication
- Load testing for performance validation
- User acceptance testing for auth flows
