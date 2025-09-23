import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountCard from '@/components/accounts/AccountCard';
import { Account } from '@/types/account';

// Mock the AccountService
jest.mock('@/lib/accounts', () => ({
  AccountService: {
    formatCurrency: jest.fn((amount: number) => `EGP ${amount.toFixed(2)}`),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('AccountCard', () => {
  const mockAccount: Account = {
    id: 'account-123',
    user_id: 'user-123',
    name: 'Test Bank Account',
    type: 'bank',
    balance: 1250.75,
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockOnAccountUpdated = jest.fn();
  const mockOnAccountDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders account information correctly', () => {
    render(
      <AccountCard 
        account={mockAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    expect(screen.getByText('Test Bank Account')).toBeInTheDocument();
    expect(screen.getByText('Bank Account')).toBeInTheDocument();
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('EGP 1250.75')).toBeInTheDocument();
  });

  it('displays correct account type icon and styling for bank account', () => {
    render(
      <AccountCard 
        account={mockAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    const typeContainer = screen.getByText('Bank Account').closest('div')?.previousElementSibling;
    expect(typeContainer).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays correct account type for cash account', () => {
    const cashAccount: Account = {
      ...mockAccount,
      type: 'cash',
    };

    render(
      <AccountCard 
        account={cashAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });

  it('displays correct account type for wallet account', () => {
    const walletAccount: Account = {
      ...mockAccount,
      type: 'wallet',
    };

    render(
      <AccountCard 
        account={walletAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );
    expect(screen.getByText('Digital Wallet')).toBeInTheDocument();
  });

  it('displays correct account type for credit card account', () => {
    const creditAccount: Account = {
      ...mockAccount,
      type: 'credit_card',
    };

    render(
      <AccountCard 
        account={creditAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('shows positive balance in green', () => {
    render(
      <AccountCard 
        account={mockAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    const balanceElement = screen.getByText('EGP 1250.75');
    expect(balanceElement).toHaveClass('text-green-600');
  });

  it('shows negative balance in red', () => {
    const negativeAccount: Account = {
      ...mockAccount,
      balance: -500.25,
    };

    render(
      <AccountCard 
        account={negativeAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    const balanceElement = screen.getByText('EGP -500.25');
    expect(balanceElement).toHaveClass('text-red-600');
  });

  it('shows zero balance in gray', () => {
    const zeroAccount: Account = {
      ...mockAccount,
      balance: 0,
    };

    render(
      <AccountCard 
        account={zeroAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    const balanceElement = screen.getByText('EGP 0.00');
    expect(balanceElement).toHaveClass('text-gray-600');
  });

  it('formats creation date correctly', () => {
    render(
      <AccountCard 
        account={mockAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <AccountCard 
        account={mockAccount}
        onAccountUpdated={mockOnAccountUpdated}
        onAccountDeleted={mockOnAccountDeleted}
      />
    );

    expect(screen.getByText('View Transactions')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  describe('Edit functionality', () => {
    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(screen.getByDisplayValue('Test Bank Account')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('cancels edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Enter edit mode
      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Cancel edit mode
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.getByText('Test Bank Account')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Test Bank Account')).not.toBeInTheDocument();
    });

    it('validates account name input', async () => {
      const user = userEvent.setup();
      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Enter edit mode
      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Clear input and try to save
      const input = screen.getByDisplayValue('Test Bank Account');
      await user.clear(input);
      await user.type(input, 'A');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(screen.getByText('Account name must be 2-50 characters long')).toBeInTheDocument();
    });

    it('successfully updates account name', async () => {
      const user = userEvent.setup();
      const updatedAccount = {
        ...mockAccount,
        name: 'Updated Bank Account'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedAccount),
      });

      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Enter edit mode
      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Update name
      const input = screen.getByDisplayValue('Test Bank Account');
      await user.clear(input);
      await user.type(input, 'Updated Bank Account');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/accounts/${mockAccount.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated Bank Account',
          }),
        });
        expect(mockOnAccountUpdated).toHaveBeenCalledWith(updatedAccount);
      });
    });

    it('handles account update error', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Update failed' }),
      });

      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Enter edit mode
      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Update name
      const input = screen.getByDisplayValue('Test Bank Account');
      await user.clear(input);
      await user.type(input, 'Updated Name');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Delete functionality', () => {
    it('opens delete confirmation modal when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete "Test Bank Account"?')).toBeInTheDocument();
      expect(screen.getByText('This will also permanently delete all transactions associated with this account.')).toBeInTheDocument();
      expect(screen.getByText('Yes, Delete Account')).toBeInTheDocument();
    });

    it('closes delete confirmation modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Open modal
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Close modal
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Delete Account')).not.toBeInTheDocument();
    });

    it('successfully deletes account', async () => {
      const user = userEvent.setup();
      const deleteResponse = {
        deletedAccountId: mockAccount.id,
        deletedTransactionCount: 5
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(deleteResponse),
      });

      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Open modal
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Yes, Delete Account');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/accounts/${mockAccount.id}`, {
          method: 'DELETE',
        });
        expect(mockOnAccountDeleted).toHaveBeenCalledWith(mockAccount.id);
      });
    });

    it('handles account delete error', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Delete failed' }),
      });

      render(
        <AccountCard 
          account={mockAccount}
          onAccountUpdated={mockOnAccountUpdated}
          onAccountDeleted={mockOnAccountDeleted}
        />
      );

      // Open modal
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Yes, Delete Account');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Delete failed')).toBeInTheDocument();
      });
    });
  });
});
