'use client'

import { useState, useEffect, useMemo } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionService } from '@/lib/transactions'
import { TransactionListItem } from './TransactionListItem'
import { TransactionListSkeleton } from './TransactionListSkeleton'

type SortField = 'date' | 'amount' | 'type' | 'category' | 'description'
type SortOrder = 'asc' | 'desc'

interface TransactionListProps {
  accountId?: string
}

export function TransactionList({ accountId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/transactions${accountId ? `?accountId=${accountId}` : ''}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }
        
        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (err) {
        console.error('Error loading transactions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [accountId])

  // Sorting logic
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return sorted
  }, [transactions, sortField, sortOrder])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Handle transaction update/delete
  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    )
  }

  const handleTransactionDeleted = (deletedId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== deletedId))
  }

  // Render sorting icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>
    }
    return sortOrder === 'asc' ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    )
  }

  if (loading) {
    return <TransactionListSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error Loading Transactions
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-400 text-xl">💳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600 mb-6">
            {accountId 
              ? "This account doesn't have any transactions yet." 
              : "You haven't created any transactions yet."
            }
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with transaction count */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            All Transactions ({transactions.length})
          </h2>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  {renderSortIcon('description')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {renderSortIcon('type')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                onTransactionUpdated={handleTransactionUpdated}
                onTransactionDeleted={handleTransactionDeleted}
                viewType="table"
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="space-y-1">
          {sortedTransactions.map((transaction) => (
            <TransactionListItem
              key={transaction.id}
              transaction={transaction}
              onTransactionUpdated={handleTransactionUpdated}
              onTransactionDeleted={handleTransactionDeleted}
              viewType="card"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
