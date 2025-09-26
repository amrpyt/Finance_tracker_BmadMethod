'use client'

import { useAuth, useRequireAuth } from '@/contexts/auth-context'
import { AppNavigation } from './AppNavigation'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function AppLayout({ children, title, description }: AppLayoutProps) {
  const { user } = useAuth()
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useRequireAuth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      
      {/* Page Header */}
      {(title || description) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}
