import { GET } from '@/app/api/dashboard/stats/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth-betterauth';
import { AccountService } from '@/lib/accounts';
import { TransactionService } from '@/lib/transactions';

// Mock the dependencies
jest.mock('@/lib/auth-betterauth');
jest.mock('@/lib/accounts');
jest.mock('@/lib/transactions');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockAccountService = AccountService as jest.Mocked<typeof AccountService>;
const mockTransactionService = TransactionService as jest.Mocked<typeof TransactionService>;

describe('/api/dashboard/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccounts = [
    {
      id: 'acc1',
      user_id: 'user1',
      name: 'Checking Account',
      type: 'bank' as const,
      balance: 0,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'acc2',
      user_id: 'user1',
      name: 'Cash Wallet',
      type: 'cash' as const,
      balance: 0,
      created_at: '2025-01-01T00:00:00Z'
    }
  ];

  const mockTransactions = [
    {
      id: 'tx1',
      userId: 'user1',
      accountId: 'acc1',
      amount: 1000,
      type: 'income' as const,
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
      type: 'expense' as const,
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
      type: 'income' as const,
      category: 'Gift',
      description: 'Birthday money',
      date: '2025-01-17',
      createdAt: '2025-01-17T00:00:00Z'
    }
  ];

  it('should return dashboard stats for authenticated user', async () => {
    // Mock authenticated user session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
      session: { id: 'session1', userId: 'user1', createdAt: new Date(), updatedAt: new Date() }
    });

    // Mock service responses
    mockAccountService.getAccounts.mockResolvedValue(mockAccounts);
    mockTransactionService.getTransactions.mockResolvedValue({
      transactions: mockTransactions
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

    // Call the API endpoint
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalBalance: 850, // 800 (acc1) + 50 (acc2)
      accountBalances: [
        {
          accountId: 'acc1',
          accountName: 'Checking Account',
          accountType: 'bank',
          balance: 800 // 1000 - 200
        },
        {
          accountId: 'acc2',
          accountName: 'Cash Wallet',
          accountType: 'cash',
          balance: 50 // 50
        }
      ]
    });

    // Verify service calls
    expect(mockAccountService.getAccounts).toHaveBeenCalledWith('user1');
    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('user1');
  });

  it('should use demo mode when authentication fails', async () => {
    // Mock authentication failure
    mockAuth.api.getSession.mockRejectedValue(new Error('Auth failed'));

    // Mock service responses for demo user
    mockAccountService.getAccounts.mockResolvedValue(mockAccounts);
    mockTransactionService.getTransactions.mockResolvedValue({
      transactions: mockTransactions
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

    // Call the API endpoint
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalBalance).toBe(850);

    // Verify demo user was used
    expect(mockAccountService.getAccounts).toHaveBeenCalledWith('demo-user-123');
    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('demo-user-123');
  });

  it('should return empty stats when user has no accounts or transactions', async () => {
    // Mock authenticated user session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'user2', email: 'newuser@example.com', name: 'New User' },
      session: { id: 'session2', userId: 'user2', createdAt: new Date(), updatedAt: new Date() }
    });

    // Mock empty service responses
    mockAccountService.getAccounts.mockResolvedValue([]);
    mockTransactionService.getTransactions.mockResolvedValue({
      transactions: []
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

    // Call the API endpoint
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalBalance: 0,
      accountBalances: []
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock authenticated user session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
      session: { id: 'session1', userId: 'user1', createdAt: new Date(), updatedAt: new Date() }
    });

    // Mock service error
    mockAccountService.getAccounts.mockRejectedValue(new Error('Database connection failed'));

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

    // Call the API endpoint
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Database connection failed'
    });
  });

  it('should calculate correct balances with complex transaction scenarios', async () => {
    const complexTransactions = [
      // Account 1: Multiple income and expenses
      { id: 'tx1', userId: 'user1', accountId: 'acc1', amount: 2000, type: 'income' as const, category: 'Salary', description: 'Salary', date: '2025-01-01', createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tx2', userId: 'user1', accountId: 'acc1', amount: 500, type: 'expense' as const, category: 'Food', description: 'Groceries', date: '2025-01-02', createdAt: '2025-01-02T00:00:00Z' },
      { id: 'tx3', userId: 'user1', accountId: 'acc1', amount: 800, type: 'expense' as const, category: 'Bills', description: 'Rent', date: '2025-01-03', createdAt: '2025-01-03T00:00:00Z' },
      
      // Account 2: Negative balance scenario
      { id: 'tx4', userId: 'user1', accountId: 'acc2', amount: 100, type: 'income' as const, category: 'Gift', description: 'Birthday', date: '2025-01-04', createdAt: '2025-01-04T00:00:00Z' },
      { id: 'tx5', userId: 'user1', accountId: 'acc2', amount: 300, type: 'expense' as const, category: 'Shopping', description: 'Emergency expense', date: '2025-01-05', createdAt: '2025-01-05T00:00:00Z' },
    ];

    // Mock authenticated user session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
      session: { id: 'session1', userId: 'user1', createdAt: new Date(), updatedAt: new Date() }
    });

    // Mock service responses
    mockAccountService.getAccounts.mockResolvedValue(mockAccounts);
    mockTransactionService.getTransactions.mockResolvedValue({
      transactions: complexTransactions
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

    // Call the API endpoint
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalBalance: 500, // 700 (acc1) + (-200) (acc2)
      accountBalances: [
        {
          accountId: 'acc1',
          accountName: 'Checking Account',
          accountType: 'bank',
          balance: 700 // 2000 - 500 - 800
        },
        {
          accountId: 'acc2',
          accountName: 'Cash Wallet',
          accountType: 'cash',
          balance: -200 // 100 - 300
        }
      ]
    });
  });
});
