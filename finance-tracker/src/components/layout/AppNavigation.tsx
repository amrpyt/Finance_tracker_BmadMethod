'use client'

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppNavigation() {
  const { user, signOut, authType, isMigrated } = useAuth()
  const pathname = usePathname()

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Transactions', href: '/transactions', icon: '💳' },
    { name: 'Accounts', href: '/accounts', icon: '🏦' },
    { name: 'Reports', href: '/reports', icon: '📊' },
  ]

  const isActivePage = (href: string) => {
    return pathname === href
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Finance Tracker
            </h1>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActivePage(item.href)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span>Welcome, {user?.name || user?.email}</span>
              {isMigrated && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Enhanced Security
                </span>
              )}
              <span className="ml-2 text-xs text-gray-500">({authType})</span>
            </div>
            <button
              onClick={signOut}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3">
            <div className="flex space-x-1 overflow-x-auto">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActivePage(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
