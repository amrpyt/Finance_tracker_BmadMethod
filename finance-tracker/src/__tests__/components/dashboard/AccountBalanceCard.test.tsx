import { render, screen } from '@testing-library/react';
import { AccountBalanceCard } from '@/components/dashboard/AccountBalanceCard';

describe('AccountBalanceCard', () => {
  const defaultProps = {
    accountId: 'acc1',
    accountName: 'Checking Account',
    accountType: 'bank' as const,
    balance: 1234.56
  };

  it('renders account information correctly', () => {
    render(<AccountBalanceCard {...defaultProps} />);
    
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
    expect(screen.getByText('Bank Account')).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('displays correct icon for bank account', () => {
    render(<AccountBalanceCard {...defaultProps} accountType="bank" />);
    
    expect(screen.getByText('🏦')).toBeInTheDocument();
  });

  it('displays correct icon for cash account', () => {
    render(<AccountBalanceCard {...defaultProps} accountType="cash" />);
    
    expect(screen.getByText('💵')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });

  it('displays correct icon for wallet account', () => {
    render(<AccountBalanceCard {...defaultProps} accountType="wallet" />);
    
    expect(screen.getByText('👛')).toBeInTheDocument();
    expect(screen.getByText('Wallet')).toBeInTheDocument();
  });

  it('displays correct icon for credit card account', () => {
    render(<AccountBalanceCard {...defaultProps} accountType="credit_card" />);
    
    expect(screen.getByText('💳')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('applies positive balance styling for positive amounts', () => {
    render(<AccountBalanceCard {...defaultProps} balance={1000} />);
    
    const balanceElement = screen.getByText('$1,000.00');
    expect(balanceElement).toHaveClass('text-green-600');
  });

  it('applies negative balance styling for negative amounts', () => {
    render(<AccountBalanceCard {...defaultProps} balance={-500} />);
    
    const balanceElement = screen.getByText('-$500.00');
    expect(balanceElement).toHaveClass('text-red-600');
  });

  it('applies zero balance styling for zero amount', () => {
    render(<AccountBalanceCard {...defaultProps} balance={0} />);
    
    const balanceElement = screen.getByText('$0.00');
    expect(balanceElement).toHaveClass('text-gray-600');
  });

  it('handles long account names gracefully', () => {
    const longName = 'This is a very long account name that should be truncated';
    render(<AccountBalanceCard {...defaultProps} accountName={longName} />);
    
    expect(screen.getByText(longName)).toBeInTheDocument();
    expect(screen.getByText(longName)).toHaveClass('truncate');
  });

  it('displays account balance label', () => {
    render(<AccountBalanceCard {...defaultProps} />);
    
    expect(screen.getByText('Account Balance')).toBeInTheDocument();
  });
});
