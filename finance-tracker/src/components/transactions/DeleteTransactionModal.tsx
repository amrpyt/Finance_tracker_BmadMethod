'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionService } from '@/lib/transactions'

interface DeleteTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onTransactionDeleted: (id: string) => void
}

export function DeleteTransactionModal({ 
  transaction, 
  onClose, 
  onTransactionDeleted 
}: DeleteTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }

      onTransactionDeleted(transaction.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAmountDisplay = () => {
    const formatted = TransactionService.formatCurrency(transaction.amount)
    const prefix = transaction.type === 'income' ? '+' : '-'
    return `${prefix}${formatted}`
  }

  const getTypeBadgeColor = () => {
    return transaction.type === 'income' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg 
                className="h-6 w-6 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Delete Transaction
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Description:</span>
                <span className="text-sm text-gray-900 max-w-48 text-right truncate" title={transaction.description}>
                  {transaction.description}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <span className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getAmountDisplay()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor()}`}>
                  {transaction.type}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="text-sm text-gray-900">{transaction.category}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <span className="text-sm text-gray-900">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>

          {/* Balance Impact Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Balance Impact
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    Deleting this {transaction.type} transaction will {transaction.type === 'income' ? 'decrease' : 'increase'} your account balance by {TransactionService.formatCurrency(transaction.amount)}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Delete Transaction'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
