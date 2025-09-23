import { AccountService } from '@/lib/accounts';
import { supabase } from '@/lib/database';

// Mock Supabase
jest.mock('@/lib/database', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const mockAccount = {
        id: 'account-123',
        user_id: 'user-123',
        name: 'Test Bank',
        type: 'bank',
        created_at: '2023-01-01T00:00:00Z',
      };

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockAccount,
          error: null,
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await AccountService.createAccount('user-123', {
        name: 'Test Bank',
        type: 'bank',
      });

      expect(result).toEqual({
        ...mockAccount,
        balance: 0,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        name: 'Test Bank',
        type: 'bank',
      });
    });

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Database error' };

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      await expect(
        AccountService.createAccount('user-123', {
          name: 'Test Bank',
          type: 'bank',
        })
      ).rejects.toThrow('Failed to create account: Database error');
    });
  });

  describe('getAccounts', () => {
    it('should return empty array when no accounts exist', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await AccountService.getAccounts('user-123');

      expect(result).toEqual([]);
    });

    it('should return accounts with calculated balances', async () => {
      const mockAccounts = [
        {
          id: 'account-123',
          user_id: 'user-123',
          name: 'Test Bank',
          type: 'bank',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockAccounts,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      // Mock balance calculation
      jest.spyOn(AccountService, 'calculateAccountBalance').mockResolvedValue(1000);

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await AccountService.getAccounts('user-123');

      expect(result).toEqual([
        {
          ...mockAccounts[0],
          balance: 1000,
        },
      ]);
    });
  });

  describe('calculateAccountBalance', () => {
    it('should calculate balance correctly with mixed transactions', async () => {
      const mockTransactions = [
        { amount: 1000, type: 'income' },
        { amount: 200, type: 'expense' },
        { amount: 500, type: 'income' },
        { amount: 150, type: 'expense' },
      ];

      const mockEq = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const balance = await AccountService.calculateAccountBalance('account-123');

      // 1000 + 500 - 200 - 150 = 1150
      expect(balance).toBe(1150);
    });

    it('should return 0 for accounts with no transactions', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const balance = await AccountService.calculateAccountBalance('account-123');

      expect(balance).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format EGP currency correctly', () => {
      const formatted = AccountService.formatCurrency(1234.56);
      expect(formatted).toBe('EGP 1,234.56');
    });

    it('should format zero correctly', () => {
      const formatted = AccountService.formatCurrency(0);
      expect(formatted).toBe('EGP 0.00');
    });

    it('should format negative amounts correctly', () => {
      const formatted = AccountService.formatCurrency(-500.75);
      expect(formatted).toBe('-EGP 500.75');
    });
  });
});
