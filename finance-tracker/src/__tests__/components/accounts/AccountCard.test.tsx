import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountCard from '@/components/accounts/AccountCard';
import { Account } from '@/types/account';

// Mock the AccountService
jest.mock('@/lib/accounts', () => ({
  AccountService: {
    formatCurrency: jest.fn((amount: number) => `EGP ${amount.toFixed(2)}`),
  },
}));

describe('AccountCard', () => {
  const mockAccount: Account = {
    id: 'account-123',
    user_id: 'user-123',
    name: 'Test Bank Account',
    type: 'bank',
    balance: 1250.75,
    created_at: '2023-01-01T00:00:00Z',
  };

  it('renders account information correctly', () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText('Test Bank Account')).toBeInTheDocument();
    expect(screen.getByText('Bank Account')).toBeInTheDocument();
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('EGP 1250.75')).toBeInTheDocument();
  });

  it('displays correct account type icon and styling for bank account', () => {
    render(<AccountCard account={mockAccount} />);

    const typeContainer = screen.getByText('Bank Account').closest('div')?.previousElementSibling;
    expect(typeContainer).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays correct account type for cash account', () => {
    const cashAccount: Account = {
      ...mockAccount,
      type: 'cash',
    };

    render(<AccountCard account={cashAccount} />);
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });

  it('displays correct account type for wallet account', () => {
    const walletAccount: Account = {
      ...mockAccount,
      type: 'wallet',
    };

    render(<AccountCard account={walletAccount} />);
    expect(screen.getByText('Digital Wallet')).toBeInTheDocument();
  });

  it('displays correct account type for credit card account', () => {
    const creditAccount: Account = {
      ...mockAccount,
      type: 'credit_card',
    };

    render(<AccountCard account={creditAccount} />);
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('shows positive balance in green', () => {
    render(<AccountCard account={mockAccount} />);

    const balanceElement = screen.getByText('EGP 1250.75');
    expect(balanceElement).toHaveClass('text-green-600');
  });

  it('shows negative balance in red', () => {
    const negativeAccount: Account = {
      ...mockAccount,
      balance: -500.25,
    };

    render(<AccountCard account={negativeAccount} />);

    const balanceElement = screen.getByText('EGP -500.25');
    expect(balanceElement).toHaveClass('text-red-600');
  });

  it('shows zero balance in gray', () => {
    const zeroAccount: Account = {
      ...mockAccount,
      balance: 0,
    };

    render(<AccountCard account={zeroAccount} />);

    const balanceElement = screen.getByText('EGP 0.00');
    expect(balanceElement).toHaveClass('text-gray-600');
  });

  it('formats creation date correctly', () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText('View Transactions')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
