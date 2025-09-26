'use client'

import { AccountType } from '@/types/account';
import { formatCurrency, getBalanceIndicator } from '@/lib/dashboard';

interface AccountBalanceCardProps {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
}

const getAccountTypeIcon = (type: AccountType): string => {
  switch (type) {
    case 'bank':
      return '🏦';
    case 'cash':
      return '💵';
    case 'wallet':
      return '👛';
    case 'credit_card':
      return '💳';
    default:
      return '💰';
  }
};

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case 'bank':
      return 'Bank Account';
    case 'cash':
      return 'Cash';
    case 'wallet':
      return 'Wallet';
    case 'credit_card':
      return 'Credit Card';
    default:
      return type;
  }
};

const getBalanceColorClasses = (balance: number): string => {
  const indicator = getBalanceIndicator(balance);
  switch (indicator) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    case 'zero':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export function AccountBalanceCard({ accountId: _accountId, accountName, accountType, balance }: AccountBalanceCardProps) {
  const balanceColorClasses = getBalanceColorClasses(balance);
  const accountIcon = getAccountTypeIcon(accountType);
  const accountTypeLabel = getAccountTypeLabel(accountType);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <span className="text-xl">{accountIcon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {accountName}
              </dt>
              <dd className="text-xs text-gray-400 mb-1">
                {accountTypeLabel}
              </dd>
              <dd className={`text-lg font-bold ${balanceColorClasses}`}>
                {formatCurrency(balance)}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Optional: Balance trend indicator */}
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-xs text-gray-500">
          Account Balance
        </div>
      </div>
    </div>
  );
}
