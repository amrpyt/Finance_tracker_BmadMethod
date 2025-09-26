'use client'

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/lib/dashboard';
import { AccountBalanceCard } from './AccountBalanceCard';
import { TotalNetWorthCard } from './TotalNetWorthCard';
import { RecentTransactionsFeed } from './RecentTransactionsFeed';

interface DashboardBalancesProps {
  className?: string;
}

export function DashboardBalances({ className = '' }: DashboardBalancesProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }
      
      const data: DashboardStats = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Refresh function for real-time updates
  const refreshStats = () => {
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton for Total Net Worth */}
        <div className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
        
        {/* Loading skeleton for account cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refreshStats}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return null;
  }

  const { totalBalance, accountBalances, recentTransactions } = dashboardStats;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Total Net Worth Card */}
      <TotalNetWorthCard 
        totalBalance={totalBalance} 
        accountCount={accountBalances.length} 
      />
      
      {/* Account Balance Cards */}
      {accountBalances.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Account Balances</h3>
            <button
              onClick={refreshStats}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountBalances.map((account) => (
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
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Accounts Found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first account to start tracking your finances.
          </p>
          <a
            href="/accounts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Add Account
          </a>
        </div>
      )}
      
      {/* Recent Transactions Feed */}
      <RecentTransactionsFeed 
        transactions={recentTransactions || []} 
        loading={loading}
        error={error}
      />
    </div>
  );
}
