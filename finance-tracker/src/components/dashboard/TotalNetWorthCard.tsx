'use client'

import { formatCurrency, getBalanceIndicator } from '@/lib/dashboard';

interface TotalNetWorthCardProps {
  totalBalance: number;
  accountCount: number;
}


const getNetWorthIcon = (balance: number): string => {
  const indicator = getBalanceIndicator(balance);
  switch (indicator) {
    case 'positive':
      return '📈';
    case 'negative':
      return '📉';
    case 'zero':
      return '⚖️';
    default:
      return '💰';
  }
};

export function TotalNetWorthCard({ totalBalance, accountCount }: TotalNetWorthCardProps) {
  const netWorthIcon = getNetWorthIcon(totalBalance);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden shadow-lg rounded-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{netWorthIcon}</span>
            </div>
          </div>
          <div className="ml-6 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-blue-100 truncate">
                Total Net Worth
              </dt>
              <dd className="text-3xl font-bold text-white mt-1">
                {formatCurrency(totalBalance)}
              </dd>
              <dd className="text-xs text-blue-200 mt-1">
                Across {accountCount} {accountCount === 1 ? 'account' : 'accounts'}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-800 bg-opacity-30 px-6 py-3">
        <div className="text-xs text-blue-100">
          Updated in real-time
        </div>
      </div>
    </div>
  );
}
