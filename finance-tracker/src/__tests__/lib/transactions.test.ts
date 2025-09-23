import { TransactionService } from '../../lib/transactions';
import { 
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Transaction
} from '../../types/transaction';

// Mock the database module
const mockSupabase = {
  from: jest.fn()
};

jest.mock('../../lib/database', () => ({
  supabase: mockSupabase
}));

// Mock AccountService
jest.mock('../../lib/accounts', () => ({
  AccountService: {
    calculateAccountBalance: jest.fn().mockResolvedValue(1000.00)
  }
}));

describe('TransactionService', () => {
  const mockUserId = 'user-123';
  const mockAccountId = 'account-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    const validCreateRequest: CreateTransactionRequest = {
      accountId: mockAccountId,
      amount: 25.99,
      type: 'expense',
      category: 'Food',
      description: 'Lunch at restaurant',
      date: '2023-12-01'
    };

    it('should create transaction successfully', async () => {
      const mockAccount = { id: mockAccountId, user_id: mockUserId };
      const mockTransaction = {
        id: 'transaction-123',
        user_id: mockUserId,
        account_id: mockAccountId,
        amount: 25.99,
        type: 'expense',
        category: 'Food',
        description: 'Lunch at restaurant',
        date: '2023-12-01',
        created_at: '2023-12-01T12:00:00Z'
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: mockAccount, error: null })
                })
              })
            })
          };
        }
        if (table === 'transactions') {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: mockTransaction, error: null })
              })
            })
          };
        }
      });

      const result = await TransactionService.createTransaction(mockUserId, validCreateRequest);

      expect(result.transaction.id).toBe('transaction-123');
      expect(result.transaction.amount).toBe(25.99);
      expect(result.transaction.type).toBe('expense');
      expect(result.updatedAccountBalance).toBe(1000.00);
    });

    it('should handle account not found error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
            })
          })
        })
      }));

      await expect(
        TransactionService.createTransaction(mockUserId, validCreateRequest)
      ).rejects.toThrow('Account not found or access denied');
    });

    it('should fallback to mock data on database error', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await TransactionService.createTransaction(mockUserId, validCreateRequest);

      expect(result.transaction.amount).toBe(25.99);
      expect(result.transaction.type).toBe('expense');
      expect(result.transaction.userId).toBe(mockUserId);
      expect(result.updatedAccountBalance).toBe(974.01); // 1000 - 25.99
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          user_id: mockUserId,
          account_id: mockAccountId,
          amount: 50.00,
          type: 'expense',
          category: 'Food',
          description: 'Dinner',
          date: '2023-12-01',
          created_at: '2023-12-01T19:00:00Z'
        }
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => Promise.resolve({ data: mockTransactions, error: null })
            })
          })
        })
      }));

      const result = await TransactionService.getTransactions(mockUserId);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].id).toBe('transaction-1');
      expect(result.transactions[0].amount).toBe(50.00);
    });

    it('should filter by account ID when provided', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          user_id: mockUserId,
          account_id: mockAccountId,
          amount: 50.00,
          type: 'expense',
          category: 'Food',
          description: 'Dinner',
          date: '2023-12-01',
          created_at: '2023-12-01T19:00:00Z'
        }
      ];

      const mockQuery = {
        select: () => ({
          eq: jest.fn(() => ({
            order: () => ({
              order: () => Promise.resolve({ data: mockTransactions, error: null })
            }),
            eq: jest.fn(() => ({
              order: () => ({
                order: () => Promise.resolve({ data: mockTransactions, error: null })
              })
            }))
          }))
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await TransactionService.getTransactions(mockUserId, mockAccountId);

      expect(mockQuery.select().eq().eq).toHaveBeenCalledWith('account_id', mockAccountId);
      expect(result.transactions).toHaveLength(1);
    });

    it('should fallback to mock data on database error', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await TransactionService.getTransactions(mockUserId);

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].type).toBe('expense');
      expect(result.transactions[1].type).toBe('income');
    });
  });

  describe('updateTransaction', () => {
    const updateRequest: UpdateTransactionRequest = {
      amount: 30.00,
      description: 'Updated description'
    };

    it('should update transaction successfully', async () => {
      const mockExistingTransaction = {
        id: 'transaction-123',
        user_id: mockUserId,
        account_id: mockAccountId
      };

      const mockUpdatedTransaction = {
        id: 'transaction-123',
        user_id: mockUserId,
        account_id: mockAccountId,
        amount: 30.00,
        type: 'expense',
        category: 'Food',
        description: 'Updated description',
        date: '2023-12-01',
        created_at: '2023-12-01T12:00:00Z'
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: mockExistingTransaction, error: null })
                })
              })
            }),
            update: () => ({
              eq: () => ({
                eq: () => ({
                  select: () => ({
                    single: () => Promise.resolve({ data: mockUpdatedTransaction, error: null })
                  })
                })
              })
            })
          };
        }
      });

      const result = await TransactionService.updateTransaction(mockUserId, 'transaction-123', updateRequest);

      expect(result.transaction.amount).toBe(30.00);
      expect(result.transaction.description).toBe('Updated description');
      expect(result.updatedAccountBalance).toBe(1000.00);
    });

    it('should handle transaction not found error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
            })
          })
        })
      }));

      await expect(
        TransactionService.updateTransaction(mockUserId, 'invalid-id', updateRequest)
      ).rejects.toThrow('Transaction not found or access denied');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      const mockExistingTransaction = {
        id: 'transaction-123',
        user_id: mockUserId,
        account_id: mockAccountId
      };

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockExistingTransaction, error: null })
            })
          })
        }),
        delete: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        })
      }));

      const result = await TransactionService.deleteTransaction(mockUserId, 'transaction-123');

      expect(result.deletedTransactionId).toBe('transaction-123');
      expect(result.updatedAccountBalance).toBe(1000.00);
    });

    it('should handle transaction not found error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
            })
          })
        })
      }));

      await expect(
        TransactionService.deleteTransaction(mockUserId, 'invalid-id')
      ).rejects.toThrow('Transaction not found or access denied');
    });
  });

  describe('getTransactionById', () => {
    it('should fetch transaction by ID successfully', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        user_id: mockUserId,
        account_id: mockAccountId,
        amount: 25.99,
        type: 'expense',
        category: 'Food',
        description: 'Lunch',
        date: '2023-12-01',
        created_at: '2023-12-01T12:00:00Z'
      };

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockTransaction, error: null })
            })
          })
        })
      }));

      const result = await TransactionService.getTransactionById(mockUserId, 'transaction-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('transaction-123');
      expect(result?.amount).toBe(25.99);
    });

    it('should return null for non-existent transaction', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
            })
          })
        })
      }));

      const result = await TransactionService.getTransactionById(mockUserId, 'invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('getTransactionSummary', () => {
    it('should calculate transaction summary successfully', async () => {
      const mockTransactions = [
        { amount: 100.00, type: 'income' },
        { amount: 30.00, type: 'expense' },
        { amount: 200.00, type: 'income' },
        { amount: 50.00, type: 'expense' }
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => Promise.resolve({ data: mockTransactions, error: null })
        })
      }));

      const result = await TransactionService.getTransactionSummary(mockUserId);

      expect(result.totalIncome).toBe(300.00);
      expect(result.totalExpenses).toBe(80.00);
      expect(result.transactionCount).toBe(4);
      expect(result.balance).toBe(220.00);
    });

    it('should return zero summary for no transactions', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        })
      }));

      const result = await TransactionService.getTransactionSummary(mockUserId);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.balance).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in EGP by default', () => {
      const formatted = TransactionService.formatCurrency(1250.75);
      expect(formatted).toContain('1,250.75');
      expect(formatted).toContain('EGP');
    });

    it('should format currency with specified currency', () => {
      const formatted = TransactionService.formatCurrency(1250.75, 'USD');
      expect(formatted).toContain('1,250.75');
      expect(formatted).toContain('$');
    });
  });
});
