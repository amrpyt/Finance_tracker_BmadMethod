'use client';

import { useState, useEffect } from 'react';
import { 
  Transaction, 
  CreateTransactionRequest,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  validateAmount,
  validateDescription,
  validateTransactionDate,
  validateTransactionCategory,
  getCategoriesForType,
  isCategoryValidForType
} from '@/types/transaction';
import { Account } from '@/types/account';

interface TransactionFormProps {
  accounts: Account[];
  onTransactionAdded: (transaction: Transaction, updatedBalance: number) => void;
  onCancel: () => void;
  defaultAccountId?: string;
}

export default function TransactionForm({ 
  accounts, 
  onTransactionAdded, 
  onCancel, 
  defaultAccountId 
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    accountId: defaultAccountId || (accounts.length > 0 ? accounts[0].id : ''),
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    accountId?: string;
    amount?: string;
    type?: string;
    category?: string;
    description?: string;
    date?: string;
  }>({});

  // Update category when type changes
  useEffect(() => {
    const validCategories = getCategoriesForType(formData.type);
    if (!isCategoryValidForType(formData.category, formData.type)) {
      setFormData(prev => ({ 
        ...prev, 
        category: validCategories[0] as string 
      }));
    }
  }, [formData.type, formData.category]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.accountId || !accounts.find(acc => acc.id === formData.accountId)) {
      errors.accountId = 'Please select a valid account';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || !validateAmount(amount)) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!validateTransactionCategory(formData.category)) {
      errors.category = 'Please select a valid category';
    }

    if (!validateDescription(formData.description)) {
      errors.description = 'Description must be between 3 and 100 characters';
    }

    if (!validateTransactionDate(formData.date)) {
      errors.date = 'Please select a valid date (not in the future)';
    }

    // Validate category matches type
    if (!isCategoryValidForType(formData.category, formData.type)) {
      errors.category = `Category "${formData.category}" is not valid for ${formData.type} transactions`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const transactionData: CreateTransactionRequest = {
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const result = await response.json();
      
      onTransactionAdded(result.transaction, result.updatedAccountBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category: getCategoriesForType(type)[0] as string 
    }));
    
    // Clear category validation error
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const getCategoryDisplayName = (category: string) => {
    return category;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: { [key: string]: string } = {
      // Expense categories
      'Food': 'Meals, groceries, dining out',
      'Transportation': 'Fuel, public transport, parking',
      'Entertainment': 'Movies, games, subscriptions',
      'Shopping': 'Clothing, electronics, household items',
      'Bills': 'Utilities, rent, insurance',
      'Healthcare': 'Medical expenses, pharmacy',
      'Education': 'Courses, books, training',
      // Income categories
      'Salary': 'Regular employment income',
      'Freelance': 'Contract work, consulting',
      'Investment': 'Dividends, capital gains',
      'Business': 'Business revenue, profits',
      'Gift': 'Money received as gifts',
      'Other': 'Miscellaneous income'
    };
    return descriptions[category] || '';
  };

  const getSelectedAccount = () => {
    return accounts.find(acc => acc.id === formData.accountId);
  };

  const selectedAccount = getSelectedAccount();
  const availableCategories = getCategoriesForType(formData.type);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Transaction</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
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
        {/* Account Selection */}
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
            Account
          </label>
          <select
            id="accountId"
            name="accountId"
            value={formData.accountId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.accountId
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} (Balance: {account.balance.toFixed(2)})
              </option>
            ))}
          </select>
          {validationErrors.accountId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.accountId}</p>
          )}
          {selectedAccount && (
            <p className="mt-1 text-sm text-gray-500">
              Current balance: {selectedAccount.balance.toFixed(2)} EGP
            </p>
          )}
        </div>

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
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.amount
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isSubmitting}
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
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {getCategoryDisplayName(category)}
              </option>
            ))}
          </select>
          {validationErrors.category && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {getCategoryDescription(formData.category)}
          </p>
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
            placeholder="e.g. Lunch at restaurant, Monthly salary, etc."
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              validationErrors.description
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/100 characters
          </p>
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
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.date
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {validationErrors.date && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || accounts.length === 0}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              formData.type === 'expense'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                {formData.type === 'expense' ? '💸' : '💰'}
                Add {formData.type === 'expense' ? 'Expense' : 'Income'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
