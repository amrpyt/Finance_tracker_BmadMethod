/**
 * Integration tests for dashboard service functions
 */
import { calculateDashboardStats, getRecentTransactions } from '../../lib/dashboard';
import { Account, Transaction } from '../../types';

describe('Dashboard Service Integration', () => {
  const mockAccounts: Account[] = [
    {
      id: 'account-1',
      user_id: 'test-user',
      name: 'Chase Checking',
      type: 'bank',
      balance: 1000,
      created_at: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 'account-2',
      user_id: 'test-user',
      name: 'Cash Wallet',
      type: 'cash',
      balance: 200,
      created_at: '2025-01-01T00:00:00.000Z'
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'test-user',
      accountId: 'account-1',
      amount: 500,
      type: 'income',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2025-01-15T09:00:00.000Z',
      createdAt: '2025-01-15T09:00:00.000Z'
    },
    {
      id: 'tx-2',
      userId: 'test-user',
      accountId: 'account-1',
      amount: 50,
      type: 'expense',
      category: 'Food',
      description: 'Lunch at restaurant',
      date: '2025-01-14T12:30:00.000Z',
      createdAt: '2025-01-14T12:30:00.000Z'
    },
    {
      id: 'tx-3',
      userId: 'test-user',
      accountId: 'account-2',
      amount: 25,
      type: 'expense',
      category: 'Transportation',
      description: 'Bus fare',
      date: '2025-01-13T08:00:00.000Z',
      createdAt: '2025-01-13T08:00:00.000Z'
    }
  ];

  describe('calculateDashboardStats', () => {
    it('should calculate complete dashboard statistics with recent transactions', () => {
      const result = calculateDashboardStats(mockAccounts, mockTransactions);

      expect(result).toHaveProperty('totalBalance');
      expect(result).toHaveProperty('accountBalances');
      expect(result).toHaveProperty('recentTransactions');
      
      // Check recent transactions are included and sorted
      expect(result.recentTransactions).toHaveLength(3);
      expect(result.recentTransactions[0].id).toBe('tx-1'); // Most recent
      expect(result.recentTransactions[2].id).toBe('tx-3'); // Oldest
    });

    it('should handle empty data gracefully', () => {
      const result = calculateDashboardStats([], []);

      expect(result.totalBalance).toBe(0);
      expect(result.accountBalances).toEqual([]);
      expect(result.recentTransactions).toEqual([]);
    });
  });

  describe('getRecentTransactions', () => {
    it('should return transactions with account information', () => {
      const result = getRecentTransactions(mockAccounts, mockTransactions);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 'tx-1',
        amount: 500,
        type: 'income',
        accountName: 'Chase Checking',
        accountType: 'bank'
      });
    });

    it('should sort transactions by date (newest first)', () => {
      const result = getRecentTransactions(mockAccounts, mockTransactions);

      const dates = result.map(tx => tx.date.getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });

    it('should limit to specified number of transactions', () => {
      const result = getRecentTransactions(mockAccounts, mockTransactions, 2);
      expect(result).toHaveLength(2);
    });

    it('should handle transactions for deleted accounts', () => {
      const transactionsWithDeletedAccount = [
        ...mockTransactions,
        {
          id: 'tx-4',
          userId: 'test-user',
          accountId: 'deleted-account',
          amount: 100,
          type: 'expense' as const,
          category: 'Food',
          description: 'Transaction for deleted account',
          date: '2025-01-16T10:00:00.000Z',
          createdAt: '2025-01-16T10:00:00.000Z'
        }
      ];

      const result = getRecentTransactions(mockAccounts, transactionsWithDeletedAccount);
      
      // Should not include transaction for deleted account
      expect(result).toHaveLength(3);
      expect(result.find(tx => tx.id === 'tx-4')).toBeUndefined();
    });
  });
});
