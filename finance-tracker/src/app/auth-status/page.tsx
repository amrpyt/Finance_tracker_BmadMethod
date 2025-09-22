'use client';

import { useAuthStatus } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export default function AuthStatusPage() {
  const authStatus = useAuthStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Status</h1>
        <div className="bg-gray-100 p-4 rounded">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔐 Authentication Status</h1>
      
      <div className="grid gap-4">
        {/* BetterAuth Status */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">BetterAuth Status</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Authenticated:</strong> {authStatus.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Loading:</strong> {authStatus.isLoading ? '⏳ Yes' : '✅ No'}</p>
            <p><strong>User:</strong> {authStatus.user ? `${authStatus.user.name} (${authStatus.user.email})` : 'None'}</p>
            <p><strong>Session:</strong> {authStatus.session ? '✅ Active' : '❌ None'}</p>
            <p><strong>Migrated:</strong> {authStatus.isMigrated ? '✅ Yes' : '❌ No'}</p>
            {authStatus.error && (
              <p className="text-red-600"><strong>Error:</strong> {JSON.stringify(authStatus.error)}</p>
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h2 className="font-semibold text-green-800 mb-2">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}</p>
            <p><strong>BetterAuth Endpoint:</strong> /api/auth/better-auth</p>
            <p><strong>Skip BetterAuth:</strong> {process.env.SKIP_BETTERAUTH === 'true' ? '✅ Yes (Development Mode)' : '❌ No'}</p>
            <p><strong>Active Auth System:</strong> {process.env.SKIP_BETTERAUTH === 'true' ? '🔒 Legacy JWT' : '🚀 BetterAuth + Legacy Fallback'}</p>
          </div>
        </div>

        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Development Notice</h2>
          <p className="text-sm text-yellow-700">
            BetterAuth client errors are expected in this development environment due to database connectivity limitations. 
            In production with proper database access, these errors will not occur.
          </p>
        </div>

        {/* Test Actions */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h2 className="font-semibold text-gray-800 mb-2">🧪 Test Actions</h2>
          <div className="flex gap-2 flex-wrap">
            <a
              href="/login"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Test Login
            </a>
            <a
              href="/signup"
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Test Signup
            </a>
            <a
              href="/test-db"
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Test Database
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
