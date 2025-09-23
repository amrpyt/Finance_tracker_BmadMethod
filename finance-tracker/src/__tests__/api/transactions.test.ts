import { NextRequest } from 'next/server';
import { POST, GET } from '../../app/api/transactions/route';
import { GET as getById, PUT, DELETE } from '../../app/api/transactions/[id]/route';

// Mock the auth module
jest.mock('../../lib/auth-betterauth', () => ({
  auth: {
    api: {
      getSession: jest.fn()
    }
  }
}));

// Mock the TransactionService
jest.mock('../../lib/transactions', () => ({
  TransactionService: {
    createTransaction: jest.fn(),
    getTransactions: jest.fn(),
    getTransactionById: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn()
  }
}));

const mockAuth = require('../../lib/auth-betterauth').auth;
const mockTransactionService = require('../../lib/transactions').TransactionService;

describe('/api/transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/transactions', () => {
    const validTransactionData = {
      accountId: 'account-123',
      amount: 25.99,
      type: 'expense',
      category: 'Food',
      description: 'Lunch at restaurant',
      date: '2023-12-01'
    };

    it('should create transaction successfully with authentication', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.createTransaction.mockResolvedValue({
        transaction: {
          id: 'transaction-123',
          userId: 'user-123',
          accountId: 'account-123',
          amount: 25.99,
          type: 'expense',
          category: 'Food',
          description: 'Lunch at restaurant',
          date: '2023-12-01',
          createdAt: '2023-12-01T12:00:00Z'
        },
        updatedAccountBalance: 974.01
      });

      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(validTransactionData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.transaction.amount).toBe(25.99);
      expect(data.updatedAccountBalance).toBe(974.01);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith('user-123', validTransactionData);
    });

    it('should create transaction in demo mode when auth fails', async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error('Auth failed'));

      mockTransactionService.createTransaction.mockResolvedValue({
        transaction: {
          id: 'transaction-123',
          userId: 'demo-user-123',
          accountId: 'account-123',
          amount: 25.99,
          type: 'expense',
          category: 'Food',
          description: 'Lunch at restaurant',
          date: '2023-12-01',
          createdAt: '2023-12-01T12:00:00Z'
        },
        updatedAccountBalance: 974.01
      });

      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(validTransactionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith('demo-user-123', validTransactionData);
    });

    it('should return 400 for invalid transaction data', async () => {
      const invalidData = {
        accountId: 'account-123',
        amount: -25.99, // Invalid negative amount
        type: 'expense',
        category: 'Food',
        description: 'Lunch',
        date: '2023-12-01'
      };

      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request data');
    });

    it('should return 404 when account not found', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.createTransaction.mockRejectedValue(
        new Error('Account not found or access denied')
      );

      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(validTransactionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Account not found');
    });

    it('should return 500 for service errors', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.createTransaction.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(validTransactionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/transactions', () => {
    const mockTransactions = [
      {
        id: 'transaction-1',
        userId: 'user-123',
        accountId: 'account-123',
        amount: 50.00,
        type: 'expense',
        category: 'Food',
        description: 'Dinner',
        date: '2023-12-01',
        createdAt: '2023-12-01T19:00:00Z'
      }
    ];

    it('should fetch all transactions successfully', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.getTransactions.mockResolvedValue({
        transactions: mockTransactions
      });

      const request = new NextRequest('http://localhost/api/transactions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toHaveLength(1);
      expect(data.transactions[0].id).toBe('transaction-1');
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('user-123', undefined);
    });

    it('should filter transactions by account ID', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.getTransactions.mockResolvedValue({
        transactions: mockTransactions
      });

      const request = new NextRequest('http://localhost/api/transactions?accountId=account-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('user-123', 'account-123');
    });

    it('should work in demo mode', async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error('Auth failed'));

      mockTransactionService.getTransactions.mockResolvedValue({
        transactions: mockTransactions
      });

      const request = new NextRequest('http://localhost/api/transactions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('demo-user-123', undefined);
    });
  });

  describe('GET /api/transactions/[id]', () => {
    const mockTransaction = {
      id: 'transaction-123',
      userId: 'user-123',
      accountId: 'account-123',
      amount: 25.99,
      type: 'expense',
      category: 'Food',
      description: 'Lunch',
      date: '2023-12-01',
      createdAt: '2023-12-01T12:00:00Z'
    };

    it('should fetch transaction by ID successfully', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.getTransactionById.mockResolvedValue(mockTransaction);

      const request = new NextRequest('http://localhost/api/transactions/transaction-123');

      const response = await getById(request, { params: { id: 'transaction-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('transaction-123');
      expect(mockTransactionService.getTransactionById).toHaveBeenCalledWith('user-123', 'transaction-123');
    });

    it('should return 404 for non-existent transaction', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.getTransactionById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/transactions/invalid-id');

      const response = await getById(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Transaction not found');
    });
  });

  describe('PUT /api/transactions/[id]', () => {
    const updateData = {
      amount: 35.00,
      description: 'Updated lunch expense'
    };

    it('should update transaction successfully', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.updateTransaction.mockResolvedValue({
        transaction: {
          id: 'transaction-123',
          userId: 'user-123',
          accountId: 'account-123',
          amount: 35.00,
          type: 'expense',
          category: 'Food',
          description: 'Updated lunch expense',
          date: '2023-12-01',
          createdAt: '2023-12-01T12:00:00Z'
        },
        updatedAccountBalance: 965.00
      });

      const request = new NextRequest('http://localhost/api/transactions/transaction-123', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: 'transaction-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transaction.amount).toBe(35.00);
      expect(data.transaction.description).toBe('Updated lunch expense');
      expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith('user-123', 'transaction-123', updateData);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        amount: -35.00 // Invalid negative amount
      };

      const request = new NextRequest('http://localhost/api/transactions/transaction-123', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });

      const response = await PUT(request, { params: { id: 'transaction-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid update data');
    });
  });

  describe('DELETE /api/transactions/[id]', () => {
    it('should delete transaction successfully', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.deleteTransaction.mockResolvedValue({
        deletedTransactionId: 'transaction-123',
        updatedAccountBalance: 1000.00
      });

      const request = new NextRequest('http://localhost/api/transactions/transaction-123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'transaction-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deletedTransactionId).toBe('transaction-123');
      expect(data.updatedAccountBalance).toBe(1000.00);
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith('user-123', 'transaction-123');
    });

    it('should return 404 when trying to delete non-existent transaction', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockTransactionService.deleteTransaction.mockRejectedValue(
        new Error('Transaction not found or access denied')
      );

      const request = new NextRequest('http://localhost/api/transactions/invalid-id', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Transaction not found');
    });
  });
});
