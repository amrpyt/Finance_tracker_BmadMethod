'use client';

import { TransactionType, getCategoriesForType } from '@/types/transaction';

interface CategorySelectorProps {
  type: TransactionType;
  value: string;
  onChange: (category: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function CategorySelector({ type, value, onChange, disabled, error }: CategorySelectorProps) {
  const categories = getCategoriesForType(type);
  
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      // Expense categories
      'Food': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛒',
      'Bills': '📋',
      'Healthcare': '🏥',
      'Education': '📚',
      // Income categories
      'Salary': '💼',
      'Freelance': '💻',
      'Investment': '📈',
      'Business': '🏢',
      'Gift': '🎁',
      'Other': '💰'
    };
    return icons[category] || '💰';
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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category
      </label>
      
      {/* Grid of category buttons for better UX on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            disabled={disabled}
            className={`p-3 rounded-md border-2 text-left transition-colors ${
              value === category
                ? type === 'expense'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{category}</p>
                <p className="text-xs text-gray-500 truncate">
                  {getCategoryDescription(category)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Fallback dropdown for smaller screens or accessibility */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300'
        }`}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {getCategoryIcon(category)} {category}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
