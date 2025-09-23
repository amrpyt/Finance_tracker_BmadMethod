'use client';

import { TransactionType } from '@/types/transaction';

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

export default function TransactionTypeToggle({ value, onChange, disabled }: TransactionTypeToggleProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Transaction Type
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('expense')}
          disabled={disabled}
          className={`relative px-4 py-3 rounded-lg transition-all duration-200 ${
            value === 'expense'
              ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-sm'
              : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="font-medium">Expense</span>
            <span className="text-xs text-gray-500">Money going out</span>
          </div>
          
          {value === 'expense' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => onChange('income')}
          disabled={disabled}
          className={`relative px-4 py-3 rounded-lg transition-all duration-200 ${
            value === 'income'
              ? 'bg-green-100 text-green-700 border-2 border-green-300 shadow-sm'
              : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-medium">Income</span>
            <span className="text-xs text-gray-500">Money coming in</span>
          </div>
          
          {value === 'income' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
        </button>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">
          {value === 'expense' 
            ? 'This will reduce your account balance' 
            : 'This will increase your account balance'
          }
        </p>
      </div>
    </div>
  );
}
