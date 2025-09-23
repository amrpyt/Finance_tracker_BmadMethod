'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { AccountService } from '@/lib/accounts';
import { useAuth } from '@/contexts/auth-context';
import AddAccountForm from '@/components/accounts/AddAccountForm';
import AccountCard from '@/components/accounts/AccountCard';
import AccountsLoadingSkeleton from '@/components/accounts/AccountsLoadingSkeleton';
import { TransactionForm } from '@/components/transactions';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await fetch('/api/accounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountAdded = (newAccount: Account) => {
    setAccounts(prev => [...prev, newAccount]);
    setShowAddForm(false);
  };

  const handleAccountUpdated = (updatedAccount: Account) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
  };

  const handleAccountDeleted = (deletedAccountId: string) => {
    setAccounts(prev => 
      prev.filter(account => account.id !== deletedAccountId)
    );
  };

  const handleTransactionAdded = (transaction: Transaction, updatedBalance: number) => {
    // Update the account balance optimistically
    setAccounts(prev => 
      prev.map(account => 
        account.id === transaction.accountId 
          ? { ...account, balance: updatedBalance }
          : account
      )
    );
    
    // Show success message
    setTransactionSuccess(`${transaction.type === 'income' ? 'Income' : 'Expense'} of ${transaction.amount.toFixed(2)} EGP added successfully`);
    
    // Close form and reset selection
    setShowTransactionForm(false);
    setSelectedAccountId(undefined);
    
    // Clear success message after 5 seconds
    setTimeout(() => setTransactionSuccess(null), 5000);
  };

  const handleAddTransactionClick = (accountId?: string) => {
    setSelectedAccountId(accountId);
    setShowTransactionForm(true);
    setError(null); // Clear any existing errors
    setTransactionSuccess(null); // Clear any success messages
  };

  // For demo purposes, show accounts even without auth during development
  const showDemo = !user && process.env.NODE_ENV === 'development';
  
  if (!user && !showDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your accounts.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Accounts</h1>
              <p className="text-gray-600 mt-2">
                Manage your financial accounts and track your balances
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAddTransactionClick()}
                disabled={accounts.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Transaction
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Account
              </button>
            </div>
          </div>
        </div>

        {/* Add Account Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <AddAccountForm
                onAccountAdded={handleAccountAdded}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Add Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <TransactionForm
                accounts={accounts}
                onTransactionAdded={handleTransactionAdded}
                onCancel={() => {
                  setShowTransactionForm(false);
                  setSelectedAccountId(undefined);
                }}
                defaultAccountId={selectedAccountId}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {transactionSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{transactionSuccess}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setTransactionSuccess(null)}
                  className="text-green-400 hover:text-green-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <AccountsLoadingSkeleton count={6} />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading accounts</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchAccounts}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts List */}
        {!loading && !error && (
          <>
            {accounts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.621.621a3 3 0 004.242 0l.621-.621M12 6V3h3a3 3 0 013 3v1.5M12 6V3H9a3 3 0 00-3 3v1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by adding your first financial account. You can track bank accounts, cash, wallets, and credit cards.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Account
                </button>
              </div>
            ) : (
              /* Accounts Grid */
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <AccountCard 
                    key={account.id} 
                    account={account}
                    onAccountUpdated={handleAccountUpdated}
                    onAccountDeleted={handleAccountDeleted}
                    onAddTransaction={handleAddTransactionClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
