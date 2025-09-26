import {
  calculateAccountBalance,
  calculateTotalNetWorth,
  calculateAllAccountBalances,
  calculateDashboardStats,
  formatCurrency,
  getBalanceIndicator
} from '@/lib/dashboard';
import { Account, Transaction } from '@/types';

describe('Dashboard Service', () => {
  // Mock data
  const mockAccounts: Account[] = [
    {
      id: 'acc1',
      user_id: 'user1',
      name: 'Checking Account',
      type: 'bank',
      balance: 0,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'acc2',
      user_id: 'user1',
      name: 'Cash Wallet',
      type: 'cash',
      balance: 0,
      created_at: '2025-01-01T00:00:00Z'
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      userId: 'user1',
      accountId: 'acc1',
      amount: 1000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2025-01-15',
      createdAt: '2025-01-15T00:00:00Z'
    },
    {
      id: 'tx2',
      userId: 'user1',
      accountId: 'acc1',
      amount: 200,
      type: 'expense',
      category: 'Food',
      description: 'Groceries',
      date: '2025-01-16',
      createdAt: '2025-01-16T00:00:00Z'
    },
    {
      id: 'tx3',
      userId: 'user1',
      accountId: 'acc2',
      amount: 50,
      type: 'income',
      category: 'Gift',
      description: 'Birthday money',
      date: '2025-01-17',
      createdAt: '2025-01-17T00:00:00Z'
    }
  ];

  describe('calculateAccountBalance', () => {
    it('should return 0 for empty transactions', () => {
      expect(calculateAccountBalance([])).toBe(0);
    });

    it('should return 0 for null/undefined transactions', () => {
      expect(calculateAccountBalance(null as any)).toBe(0);
      expect(calculateAccountBalance(undefined as any)).toBe(0);
    });

    it('should calculate balance correctly with income and expenses', () => {
      const transactions = mockTransactions.filter(tx => tx.accountId === 'acc1');
      // 1000 (income) - 200 (expense) = 800
      expect(calculateAccountBalance(transactions)).toBe(800);
    });

    it('should calculate balance correctly with only income', () => {
      const transactions = mockTransactions.filter(tx => tx.accountId === 'acc2');
      // 50 (income) = 50
      expect(calculateAccountBalance(transactions)).toBe(50);
    });

    it('should handle negative balances correctly', () => {
      const negativeTransactions: Transaction[] = [
        {
          id: 'tx4',
          userId: 'user1',
          accountId: 'acc1',
          amount: 100,
          type: 'income',
          category: 'Salary',
          description: 'Income',
          date: '2025-01-15',
          createdAt: '2025-01-15T00:00:00Z'
        },
        {
          id: 'tx5',
          userId: 'user1',
          accountId: 'acc1',
          amount: 300,
          type: 'expense',
          category: 'Food',
          description: 'Big expense',
          date: '2025-01-16',
          createdAt: '2025-01-16T00:00:00Z'
        }
      ];
      // 100 (income) - 300 (expense) = -200
      expect(calculateAccountBalance(negativeTransactions)).toBe(-200);
    });
  });

  describe('calculateTotalNetWorth', () => {
    it('should return 0 for empty account balances', () => {
      expect(calculateTotalNetWorth([])).toBe(0);
    });

    it('should return 0 for null/undefined account balances', () => {
      expect(calculateTotalNetWorth(null as any)).toBe(0);
      expect(calculateTotalNetWorth(undefined as any)).toBe(0);
    });

    it('should sum all account balances correctly', () => {
      const accountBalances = [
        { accountId: 'acc1', accountName: 'Account 1', accountType: 'bank', balance: 800 },
        { accountId: 'acc2', accountName: 'Account 2', accountType: 'cash', balance: 50 }
      ];
      // 800 + 50 = 850
      expect(calculateTotalNetWorth(accountBalances)).toBe(850);
    });

    it('should handle negative balances in total calculation', () => {
      const accountBalances = [
        { accountId: 'acc1', accountName: 'Account 1', accountType: 'bank', balance: 500 },
        { accountId: 'acc2', accountName: 'Account 2', accountType: 'credit_card', balance: -200 }
      ];
      // 500 + (-200) = 300
      expect(calculateTotalNetWorth(accountBalances)).toBe(300);
    });
  });

  describe('calculateAllAccountBalances', () => {
    it('should return empty array for no accounts', () => {
      expect(calculateAllAccountBalances([], mockTransactions)).toEqual([]);
    });

    it('should return empty array for null/undefined accounts', () => {
      expect(calculateAllAccountBalances(null as any, mockTransactions)).toEqual([]);
      expect(calculateAllAccountBalances(undefined as any, mockTransactions)).toEqual([]);
    });

    it('should calculate balances for all accounts', () => {
      const result = calculateAllAccountBalances(mockAccounts, mockTransactions);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        accountId: 'acc1',
        accountName: 'Checking Account',
        accountType: 'bank',
        balance: 800 // 1000 - 200
      });
      expect(result[1]).toEqual({
        accountId: 'acc2',
        accountName: 'Cash Wallet',
        accountType: 'cash',
        balance: 50 // 50
      });
    });

    it('should handle accounts with no transactions', () => {
      const accountWithNoTransactions: Account = {
        id: 'acc3',
        user_id: 'user1',
        name: 'New Account',
        type: 'wallet',
        balance: 0,
        created_at: '2025-01-01T00:00:00Z'
      };
      
      const result = calculateAllAccountBalances([accountWithNoTransactions], mockTransactions);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        accountId: 'acc3',
        accountName: 'New Account',
        accountType: 'wallet',
        balance: 0
      });
    });
  });

  describe('calculateDashboardStats', () => {
    it('should calculate complete dashboard statistics', () => {
      const result = calculateDashboardStats(mockAccounts, mockTransactions);
      
      expect(result.totalBalance).toBe(850); // 800 + 50
      expect(result.accountBalances).toHaveLength(2);
      expect(result.accountBalances[0].balance).toBe(800);
      expect(result.accountBalances[1].balance).toBe(50);
    });

    it('should handle empty accounts and transactions', () => {
      const result = calculateDashboardStats([], []);
      
      expect(result.totalBalance).toBe(0);
      expect(result.accountBalances).toEqual([]);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format whole numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });
  });

  describe('getBalanceIndicator', () => {
    it('should return positive for positive balances', () => {
      expect(getBalanceIndicator(100)).toBe('positive');
      expect(getBalanceIndicator(0.01)).toBe('positive');
    });

    it('should return negative for negative balances', () => {
      expect(getBalanceIndicator(-100)).toBe('negative');
      expect(getBalanceIndicator(-0.01)).toBe('negative');
    });

    it('should return zero for zero balance', () => {
      expect(getBalanceIndicator(0)).toBe('zero');
    });
  });
});
