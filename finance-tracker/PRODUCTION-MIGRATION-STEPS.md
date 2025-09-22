# 🚀 BetterAuth Production Migration - Manual Steps

## ✅ **Current Status**
- **Development Environment:** ✅ Complete and tested
- **Authentication System:** ✅ Dual system (Legacy + BetterAuth ready)
- **Database Schema:** ⚠️ Requires manual creation in production

## 📋 **Production Migration Steps**

### **Step 1: Database Schema Creation**

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Navigate to SQL Editor

2. **Execute BetterAuth Schema**
   - Copy the contents of `scripts/create-betterauth-schema.sql`
   - Paste and run in Supabase SQL Editor
   - This creates: `user`, `account`, `session`, `verification` tables

### **Step 2: Verify Schema Creation**

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if BetterAuth tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user', 'account', 'session', 'verification');
```

Expected result: 4 tables listed.

### **Step 3: Update Environment for Production**

```env
# Set in production environment
SKIP_BETTERAUTH=false
DATABASE_URL="your-production-supabase-url"
BETTER_AUTH_SECRET="your-production-secret"
NODE_ENV=production
```

### **Step 4: Deploy Application**

```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Step 5: Test Migration**

1. **New User Registration**
   - Visit `/signup`
   - Create new user → Should use BetterAuth tables

2. **Existing User Migration**
   - Visit `/login` with existing credentials
   - Login → Should migrate user to BetterAuth automatically

3. **Verify Migration**
   - Check `/auth-status` page
   - Should show BetterAuth as active system

## 🧪 **Validation Queries**

### **Check User Migration Status**
```sql
-- See migration progress
SELECT 
    COUNT(*) as total_legacy_users,
    COUNT(*) FILTER (WHERE migrated_to_betterauth = true) as migrated_users,
    COUNT(*) FILTER (WHERE migrated_to_betterauth = false) as pending_migration
FROM users;
```

### **Check BetterAuth Tables**
```sql
-- Check BetterAuth user table
SELECT COUNT(*) as betterauth_users FROM "user";

-- Check active sessions
SELECT COUNT(*) as active_sessions FROM "session" WHERE "expiresAt" > NOW();
```

## 🎯 **Success Indicators**

- ✅ All 4 BetterAuth tables created
- ✅ New users appear in `"user"` table
- ✅ Existing users migrate on login
- ✅ Sessions created in `"session"` table
- ✅ No authentication errors in logs

## 🔄 **Rollback Plan**

If issues occur:

1. **Set Environment**
   ```env
   SKIP_BETTERAUTH=true
   ```

2. **Restart Application**
   - Falls back to legacy JWT system
   - No data loss, full backward compatibility

## 📊 **Monitoring**

- **User Migration Rate:** Check `migrated_to_betterauth` flag
- **Session Activity:** Monitor `"session"` table
- **Error Rates:** Watch application logs
- **Performance:** Monitor authentication response times

---

**🎉 Once completed, you'll have a fully functional BetterAuth system with zero-downtime migration!**
