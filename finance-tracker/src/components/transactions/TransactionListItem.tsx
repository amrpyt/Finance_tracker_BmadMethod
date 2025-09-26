'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionService } from '@/lib/transactions'
import { EditTransactionModal } from './EditTransactionModal'
import { DeleteTransactionModal } from './DeleteTransactionModal'

interface TransactionListItemProps {
  transaction: Transaction
  onTransactionUpdated: (transaction: Transaction) => void
  onTransactionDeleted: (id: string) => void
  viewType: 'table' | 'card'
}

export function TransactionListItem({ 
  transaction, 
  onTransactionUpdated, 
  onTransactionDeleted,
  viewType 
}: TransactionListItemProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format amount with proper styling
  const getAmountDisplay = () => {
    const formatted = TransactionService.formatCurrency(transaction.amount)
    const colorClass = transaction.type === 'income' 
      ? 'text-green-600' 
      : 'text-red-600'
    const prefix = transaction.type === 'income' ? '+' : '-'
    
    return (
      <span className={`font-semibold ${colorClass}`}>
        {prefix}{formatted}
      </span>
    )
  }

  // Get type badge styling
  const getTypeBadge = () => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    if (transaction.type === 'income') {
      return `${baseClass} bg-green-100 text-green-800`
    }
    return `${baseClass} bg-red-100 text-red-800`
  }

  if (viewType === 'table') {
    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatDate(transaction.date)}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            <div className="max-w-xs truncate" title={transaction.description}>
              {transaction.description}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {transaction.category}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={getTypeBadge()}>
              {transaction.type}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
            {getAmountDisplay()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>

        {/* Modals */}
        {showEditModal && (
          <EditTransactionModal
            transaction={transaction}
            onClose={() => setShowEditModal(false)}
            onTransactionUpdated={onTransactionUpdated}
          />
        )}
        {showDeleteModal && (
          <DeleteTransactionModal
            transaction={transaction}
            onClose={() => setShowDeleteModal(false)}
            onTransactionDeleted={onTransactionDeleted}
          />
        )}
      </>
    )
  }

  // Card view for mobile
  return (
    <>
      <div className="bg-white p-4 border-b border-gray-200 hover:bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={getTypeBadge()}>
              {transaction.type}
            </span>
            <span className="text-sm text-gray-500">
              {transaction.category}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(transaction.date)}
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {transaction.description}
          </p>
          <div className="text-right">
            {getAmountDisplay()}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center text-red-600 hover:text-red-700 text-sm"
          >
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditTransactionModal
          transaction={transaction}
          onClose={() => setShowEditModal(false)}
          onTransactionUpdated={onTransactionUpdated}
        />
      )}
      {showDeleteModal && (
        <DeleteTransactionModal
          transaction={transaction}
          onClose={() => setShowDeleteModal(false)}
          onTransactionDeleted={onTransactionDeleted}
        />
      )}
    </>
  )
}
