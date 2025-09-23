'use client';

import { useState } from 'react';
import { Account, AccountType, validateAccountName } from '@/types/account';
import { AccountService } from '@/lib/accounts';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountCardProps {
  account: Account;
  onAccountUpdated?: (updatedAccount: Account) => void;
  onAccountDeleted?: (deletedAccountId: string) => void;
  onAddTransaction?: (accountId: string) => void;
}

export default function AccountCard({ 
  account, 
  onAccountUpdated, 
  onAccountDeleted,
  onAddTransaction
}: AccountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(account.name);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'cash':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'wallet':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'credit_card':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-100 text-blue-800';
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'wallet':
        return 'bg-purple-100 text-purple-800';
      case 'credit_card':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeName = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'Bank Account';
      case 'cash':
        return 'Cash';
      case 'wallet':
        return 'Digital Wallet';
      case 'credit_card':
        return 'Credit Card';
      default:
        return type;
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditName(account.name);
    setError(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(account.name);
    setError(null);
  };

  const handleEditSave = async () => {
    // Validate name
    if (!validateAccountName(editName)) {
      setError('Account name must be 2-50 characters long');
      return;
    }

    if (editName.trim() === account.name) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      const updatedAccount = await response.json();
      
      // Update parent component
      if (onAccountUpdated) {
        onAccountUpdated(updatedAccount);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating account:', error);
      setError(error instanceof Error ? error.message : 'Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      const deleteResult = await response.json();
      
      // Notify parent component
      if (onAccountDeleted) {
        onAccountDeleted(account.id);
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Account Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
            {getAccountTypeIcon(account.type)}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 text-lg">{account.name}</h3>
                <p className="text-sm text-gray-500">{getAccountTypeName(account.type)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Current Balance</p>
        <p className={`text-2xl font-bold ${getBalanceColor(account.balance)}`}>
          {AccountService.formatCurrency(account.balance)}
        </p>
      </div>

      {/* Account Details */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Created</span>
          <span className="text-gray-700">{formatDate(account.created_at)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4">
        {isEditing ? (
          <div className="flex gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-16" />
              </>
            ) : (
              <>
                <button
                  onClick={handleEditSave}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-9 w-16" />
              </>
            ) : (
              <>
                <button
                  onClick={() => onAddTransaction?.(account.id)}
                  disabled={isLoading}
                  className="flex-1 bg-green-50 hover:bg-green-100 disabled:bg-green-25 text-green-700 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  + Transaction
                </button>
                <button
                  onClick={() => {/* Future: View Transactions */}}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  View
                </button>
                <button
                  onClick={handleEditStart}
                  disabled={isLoading}
                  className="bg-blue-50 hover:bg-blue-100 disabled:bg-blue-25 text-blue-700 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="bg-red-50 hover:bg-red-100 disabled:bg-red-25 text-red-700 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete "<strong>{account.name}</strong>"?
              </p>
              <p className="text-sm text-red-600">
                This will also permanently delete all transactions associated with this account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Yes, Delete Account
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
