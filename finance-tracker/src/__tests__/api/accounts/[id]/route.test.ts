/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/accounts/[id]/route';

// Mock dependencies
jest.mock('@/lib/auth-betterauth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/accounts', () => ({
  AccountService: {
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

import { auth } from '@/lib/auth-betterauth';
import { AccountService } from '@/lib/accounts';

const mockAccountService = AccountService as jest.Mocked<typeof AccountService>;

describe('/api/accounts/[id] API Routes', () => {
  const mockUpdatedAccount = {
    id: 'account-123',
    user_id: 'user-123',
    name: 'Updated Account Name',
    type: 'bank' as const,
    balance: 1500.75,
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockDeleteResult = {
    deletedAccountId: 'account-123',
    deletedTransactionCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth to return demo user
    (auth.api.getSession as jest.Mock).mockRejectedValue(new Error('Auth failed'));
  });

  describe('PUT /api/accounts/[id]', () => {
    it('successfully updates account name', async () => {
      mockAccountService.updateAccount.mockResolvedValue(mockUpdatedAccount);

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Account Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAccountService.updateAccount).toHaveBeenCalledWith(
        'demo-user-123',
        'account-123',
        { name: 'Updated Account Name' }
      );
      expect(data).toEqual({
        id: mockUpdatedAccount.id,
        name: mockUpdatedAccount.name,
        type: mockUpdatedAccount.type,
        balance: mockUpdatedAccount.balance,
        created_at: mockUpdatedAccount.created_at,
      });
    });

    it('validates request body for account update', async () => {
      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'A' }), // Too short
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data. Name must be 2-50 characters');
    });

    it('handles account not found error', async () => {
      mockAccountService.updateAccount.mockRejectedValue(new Error('Account not found or access denied'));

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Valid Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Account not found or access denied');
    });

    it('handles other server errors', async () => {
      mockAccountService.updateAccount.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Valid Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });

  describe('DELETE /api/accounts/[id]', () => {
    it('successfully deletes account and associated transactions', async () => {
      mockAccountService.deleteAccount.mockResolvedValue(mockDeleteResult);

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith(
        'demo-user-123',
        'account-123'
      );
      expect(data).toEqual(mockDeleteResult);
    });

    it('handles account not found error during deletion', async () => {
      mockAccountService.deleteAccount.mockRejectedValue(new Error('Account not found or access denied'));

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Account not found or access denied');
    });

    it('handles other server errors during deletion', async () => {
      mockAccountService.deleteAccount.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/accounts/account-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'account-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });
});
