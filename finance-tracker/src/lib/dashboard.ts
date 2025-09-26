import { Account, Transaction } from '@/types';
import { CategoryExpense, getCurrentMonthDateRange, calculateCategoryPercentages } from './chart-utils';

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  accountName: string;
  accountType: string;
}

export interface DashboardStats {
  totalBalance: number;
  accountBalances: AccountBalance[];
  recentTransactions: RecentTransaction[];
  expensesByCategory: CategoryExpense[];
}

/**
 * Calculate the balance for a specific account based on its transactions
 * Balance = SUM(income transactions) - SUM(expense transactions)
 */
export function calculateAccountBalance(transactions: Transaction[]): number {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  let balance = 0;
  
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      balance += transaction.amount;
    } else if (transaction.type === 'expense') {
      balance -= transaction.amount;
    }
  }
  
  return balance;
}

/**
 * Calculate total net worth from all account balances
 * Total Net Worth = SUM(all account balances)
 */
export function calculateTotalNetWorth(accountBalances: AccountBalance[]): number {
  if (!accountBalances || accountBalances.length === 0) {
    return 0;
  }

  return accountBalances.reduce((total, account) => total + account.balance, 0);
}

/**
 * Calculate balances for all accounts based on their transactions
 */
export function calculateAllAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): AccountBalance[] {
  if (!accounts || accounts.length === 0) {
    return [];
  }

  return accounts.map(account => {
    // Filter transactions for this specific account
    const accountTransactions = transactions.filter(
      transaction => transaction.accountId === account.id || (transaction as any).account_id === account.id
    );
    
    const balance = calculateAccountBalance(accountTransactions);
    
    return {
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      balance
    };
  });
}

/**
 * Get recent transactions with account information
 * Returns the 10 most recent transactions sorted by date (newest first)
 */
export function getRecentTransactions(
  accounts: Account[],
  transactions: Transaction[],
  limit: number = 10
): RecentTransaction[] {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Create a map of account IDs to account details for efficient lookup
  const accountMap = new Map(
    accounts.map(account => [account.id, { name: account.name, type: account.type }])
  );

  // Transform transactions and add account information
  const transactionsWithAccounts = transactions
    .map(transaction => {
      // Handle both camelCase and snake_case property names for compatibility
      const accountId = transaction.accountId || (transaction as any).account_id;
      const account = accountMap.get(accountId);
      if (!account) return null; // Skip transactions for deleted accounts

      return {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date),
        accountName: account.name,
        accountType: account.type,
      } as RecentTransaction;
    })
    .filter(Boolean) as RecentTransaction[]; // Remove null entries

  // Sort by date (newest first) and limit to specified number
  return transactionsWithAccounts
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

/**
 * Calculate expense breakdown by category for current month
 */
export function getCategoryBreakdown(transactions: Transaction[]): CategoryExpense[] {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const { start, end } = getCurrentMonthDateRange();
  
  // Filter for expense transactions in current month
  const currentMonthExpenses = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transaction.type === 'expense' &&
      transactionDate >= start &&
      transactionDate <= end
    );
  });

  if (currentMonthExpenses.length === 0) {
    return [];
  }

  // Group by category and sum amounts
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  
  for (const transaction of currentMonthExpenses) {
    const category = transaction.category || 'Uncategorized';
    
    if (!categoryTotals[category]) {
      categoryTotals[category] = { amount: 0, count: 0 };
    }
    
    categoryTotals[category].amount += transaction.amount;
    categoryTotals[category].count += 1;
  }

  // Calculate percentages and assign colors
  return calculateCategoryPercentages(categoryTotals);
}

/**
 * Calculate complete dashboard statistics
 */
export function calculateDashboardStats(
  accounts: Account[],
  transactions: Transaction[]
): DashboardStats {
  const accountBalances = calculateAllAccountBalances(accounts, transactions);
  const totalBalance = calculateTotalNetWorth(accountBalances);
  const recentTransactions = getRecentTransactions(accounts, transactions);
  const expensesByCategory = getCategoryBreakdown(transactions);
  
  return {
    totalBalance,
    accountBalances,
    recentTransactions,
    expensesByCategory
  };
}

/**
 * Format currency for display
 */
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
}

/**
 * Get balance indicator color based on value
 */
export function getBalanceIndicator(balance: number): 'positive' | 'negative' | 'zero' {
  if (balance > 0) return 'positive';
  if (balance < 0) return 'negative';
  return 'zero';
}
