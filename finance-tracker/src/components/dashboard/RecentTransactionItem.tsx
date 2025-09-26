'use client';

import { RecentTransaction } from '@/lib/dashboard';
import {
  formatTransactionDate,
  formatCurrency,
  getAmountStyleClasses,
  getTransactionIcon,
  formatAccountDisplay,
  truncateDescription
} from '@/lib/date-utils';

interface RecentTransactionItemProps {
  transaction: RecentTransaction;
  showAccount?: boolean;
}

export function RecentTransactionItem({ 
  transaction, 
  showAccount = true 
}: RecentTransactionItemProps) {
  const formattedAmount = formatCurrency(transaction.amount, transaction.type);
  const amountClasses = getAmountStyleClasses(transaction.type);
  const icon = getTransactionIcon(transaction.type);
  const formattedDate = formatTransactionDate(transaction.date);
  const accountDisplay = formatAccountDisplay(transaction.accountName, transaction.accountType);
  const truncatedDescription = truncateDescription(transaction.description, 25);

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200">
      {/* Left section: Icon and transaction details */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Transaction type icon */}
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-full
          ${transaction.type === 'income' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }
          group-hover:scale-105 transition-transform duration-200
        `}>
          <span className="text-lg font-semibold" aria-hidden="true">
            {icon}
          </span>
        </div>

        {/* Transaction information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {/* Description */}
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {truncatedDescription}
              </p>
              
              {/* Category and Account */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {transaction.category}
                </span>
                {showAccount && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {accountDisplay}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section: Amount and date */}
      <div className="flex flex-col items-end space-y-1 ml-4">
        {/* Amount */}
        <span className={`text-lg font-bold ${amountClasses}`}>
          {formattedAmount}
        </span>
        
        {/* Date */}
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default RecentTransactionItem;
