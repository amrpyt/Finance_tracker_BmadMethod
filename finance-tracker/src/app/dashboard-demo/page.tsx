'use client'

import { useState, useEffect } from 'react';
import { RecentTransactionsFeed } from '@/components/dashboard/RecentTransactionsFeed';
import { AccountBalanceCard } from '@/components/dashboard/AccountBalanceCard';
import { TotalNetWorthCard } from '@/components/dashboard/TotalNetWorthCard';

export default function DashboardDemoPage() {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the dashboard data
    setTimeout(() => {
      setDashboardStats({
        totalBalance: 2449.25,
        accountBalances: [
          {
            accountId: "mock-account-1",
            accountName: "Demo Bank Account", 
            accountType: "bank",
            balance: 2449.25
          },
          {
            accountId: "mock-account-2",
            accountName: "Cash Wallet",
            accountType: "cash", 
            balance: 0
          }
        ],
        recentTransactions: [
          {
            id: "mock-transaction-1",
            amount: 50.75,
            type: "expense" as const,
            category: "Food",
            description: "Lunch at restaurant",
            date: new Date("2025-09-26T12:00:00.000Z"),
            accountName: "Demo Bank Account",
            accountType: "bank"
          },
          {
            id: "mock-transaction-2", 
            amount: 2500,
            type: "income" as const,
            category: "Salary",
            description: "Monthly salary",
            date: new Date("2025-09-25T09:00:00.000Z"),
            accountName: "Demo Bank Account",
            accountType: "bank"
          },
          {
            id: "mock-transaction-3",
            amount: 25.50,
            type: "expense" as const,
            category: "Transportation",
            description: "Bus fare",
            date: new Date("2025-09-24T08:00:00.000Z"),
            accountName: "Cash Wallet",
            accountType: "cash"
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Dashboard UI Demo - Story 4.2
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Recent Transactions Feed with Modern UI Components
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Loading skeleton for Total Net Worth */}
            <div className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
            
            {/* Loading skeleton for account cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
              ))}
            </div>
            
            {/* Loading skeleton for recent transactions */}
            <div className="space-y-4">
              <div className="bg-gray-200 animate-pulse rounded-lg h-8 w-48"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-20"></div>
                ))}
              </div>
            </div>
          </div>
        ) : dashboardStats ? (
          <div className="space-y-8">
            {/* Total Net Worth Card */}
            <TotalNetWorthCard 
              totalBalance={dashboardStats.totalBalance} 
              accountCount={dashboardStats.accountBalances.length} 
            />
            
            {/* Account Balance Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Balances</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardStats.accountBalances.map((account: any) => (
                  <AccountBalanceCard
                    key={account.accountId}
                    accountId={account.accountId}
                    accountName={account.accountName}
                    accountType={account.accountType as 'bank' | 'cash' | 'wallet' | 'credit_card'}
                    balance={account.balance}
                  />
                ))}
              </div>
            </div>

            {/* Recent Transactions Feed - THE STAR OF STORY 4.2! */}
            <RecentTransactionsFeed 
              transactions={dashboardStats.recentTransactions} 
              loading={false}
              error={null}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Dashboard Data
            </h3>
            <p className="text-gray-600">
              Unable to fetch dashboard statistics.
            </p>
          </div>
        )}

        {/* Demo Info */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 text-2xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Demo Dashboard - Story 4.2 Implementation
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                <p className="mb-2">This page demonstrates the completed Story 4.2: Display Recent Transactions Feed</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>✅ AC1:</strong> Shows 10 most recent transactions sorted by date (newest first)</li>
                  <li><strong>✅ AC2:</strong> Displays description, amount with +/- indicators, and user-friendly dates</li>
                  <li><strong>✅ AC3:</strong> Cross-account aggregation with account names shown</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
