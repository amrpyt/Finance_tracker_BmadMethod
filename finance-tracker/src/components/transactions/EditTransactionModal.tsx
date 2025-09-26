'use client'

import { useState, useEffect } from 'react'
import { 
  Transaction, 
  UpdateTransactionRequest,
  TransactionType,
  validateAmount,
  validateDescription,
  validateTransactionDate,
  validateTransactionCategory,
  getCategoriesForType,
  isCategoryValidForType
} from '@/types/transaction'

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onTransactionUpdated: (transaction: Transaction) => void
}

export function EditTransactionModal({ 
  transaction, 
  onClose, 
  onTransactionUpdated 
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string
    type?: string
    category?: string
    description?: string
    date?: string
  }>({})

  // Update category when type changes
  useEffect(() => {
    const validCategories = getCategoriesForType(formData.type)
    if (!isCategoryValidForType(formData.category, formData.type)) {
      setFormData(prev => ({ 
        ...prev, 
        category: validCategories[0] as string 
      }))
    }
  }, [formData.type, formData.category])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || !validateAmount(amount)) {
      errors.amount = 'Amount must be a positive number'
    }

    if (!validateTransactionCategory(formData.category)) {
      errors.category = 'Please select a valid category'
    }

    if (!validateDescription(formData.description)) {
      errors.description = 'Description must be between 3 and 100 characters'
    }

    if (!validateTransactionDate(formData.date)) {
      errors.date = 'Please select a valid date (not in the future)'
    }

    // Validate category matches type
    if (!isCategoryValidForType(formData.category, formData.type)) {
      errors.category = `Category "${formData.category}" is not valid for ${formData.type} transactions`
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData: UpdateTransactionRequest = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
      }

      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction')
      }

      const result = await response.json()
      
      onTransactionUpdated(result.transaction)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category: getCategoriesForType(type)[0] as string 
    }))
    
    // Clear category validation error
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: undefined }))
    }
  }

  const availableCategories = getCategoriesForType(formData.type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">💸</span>
                    Expense
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    formData.type === 'income'
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">💰</span>
                    Income
                  </div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (EGP)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.amount
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {validationErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  validationErrors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
                placeholder="Enter transaction description..."
              />
              <div className="flex justify-between items-center mt-1">
                {validationErrors.description ? (
                  <p className="text-sm text-red-600">{validationErrors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {formData.description.length}/100 characters
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.date
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required
              />
              {validationErrors.date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
