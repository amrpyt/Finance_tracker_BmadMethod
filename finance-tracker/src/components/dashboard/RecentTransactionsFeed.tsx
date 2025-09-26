'use client';

import { RecentTransaction } from '@/lib/dashboard';
import { RecentTransactionItem } from './RecentTransactionItem';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RecentTransactionsFeedProps {
  transactions: RecentTransaction[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function RecentTransactionsFeed({ 
  transactions, 
  loading = false, 
  error = null,
  className = ''
}: RecentTransactionsFeedProps) {
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h3>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h3>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Failed to load recent transactions
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Transactions
        </h3>
        {transactions.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last {transactions.length} transactions
          </span>
        )}
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <RecentTransactionItem 
              key={transaction.id} 
              transaction={transaction}
              showAccount={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No transactions yet
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          Start tracking your finances by adding your first transaction. Your recent activity will appear here.
        </p>
        <div className="mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecentTransactionsFeed;
