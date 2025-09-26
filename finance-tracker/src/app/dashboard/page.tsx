'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardBalances } from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Financial Dashboard
          </h2>
          <p className="text-gray-600 mb-8">
            Your AI-powered finance tracker is ready to help you manage your money smarter.
          </p>
        </div>

        {/* Account Balances and Net Worth */}
        <DashboardBalances />

        {/* Future Features Cards */}
        <div className="flex justify-center mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg max-w-md">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-xl">🤖</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      AI-Powered Insights
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Coming Soon
                    </dd>
                    <dd className="text-sm text-gray-600 mt-1">
                      Smart spending analysis and financial advice
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
