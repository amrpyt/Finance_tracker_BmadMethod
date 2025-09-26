/**
 * Unit tests for RecentTransactionsFeed component
 */
import { render, screen } from '@testing-library/react';
import { RecentTransactionsFeed } from '../../../components/dashboard/RecentTransactionsFeed';
import { RecentTransaction } from '../../../lib/dashboard';

// Mock the child components
jest.mock('../../../components/dashboard/RecentTransactionItem', () => ({
  RecentTransactionItem: ({ transaction }: { transaction: RecentTransaction }) => (
    <div data-testid="transaction-item">{transaction.description}</div>
  )
}));

jest.mock('../../../components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  )
}));

const mockTransactions: RecentTransaction[] = [
  {
    id: 'tx-1',
    amount: 1500,
    type: 'income',
    category: 'Salary',
    description: 'Monthly salary payment',
    date: new Date('2025-01-15'),
    accountName: 'Chase Checking',
    accountType: 'bank'
  },
  {
    id: 'tx-2',
    amount: 85.50,
    type: 'expense',
    category: 'Food',
    description: 'Lunch at restaurant',
    date: new Date('2025-01-14'),
    accountName: 'Cash Wallet',
    accountType: 'cash'
  },
  {
    id: 'tx-3',
    amount: 25,
    type: 'expense',
    category: 'Transportation',
    description: 'Bus fare',
    date: new Date('2025-01-13'),
    accountName: 'Transit Card',
    accountType: 'wallet'
  }
];

describe('RecentTransactionsFeed', () => {
  describe('Normal State', () => {
    it('should render header and transaction list', () => {
      render(<RecentTransactionsFeed transactions={mockTransactions} />);

      // Check header
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByText('Last 3 transactions')).toBeInTheDocument();

      // Check transactions are rendered
      expect(screen.getAllByTestId('transaction-item')).toHaveLength(3);
      expect(screen.getByText('Monthly salary payment')).toBeInTheDocument();
      expect(screen.getByText('Lunch at restaurant')).toBeInTheDocument();
      expect(screen.getByText('Bus fare')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <RecentTransactionsFeed 
          transactions={mockTransactions} 
          className="custom-class" 
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<RecentTransactionsFeed transactions={[]} loading={true} />);

      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg');
      expect(screen.queryByTestId('transaction-item')).not.toBeInTheDocument();
    });

    it('should not show transaction count during loading', () => {
      render(<RecentTransactionsFeed transactions={mockTransactions} loading={true} />);

      expect(screen.queryByText(/Last \d+ transactions/)).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error is provided', () => {
      const errorMessage = 'Network connection failed';
      render(
        <RecentTransactionsFeed 
          transactions={[]} 
          error={errorMessage} 
        />
      );

      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByText('Failed to load recent transactions')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      
      // Should show error icon
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      
      expect(screen.queryByTestId('transaction-item')).not.toBeInTheDocument();
    });

    it('should not show transaction count during error', () => {
      render(
        <RecentTransactionsFeed 
          transactions={mockTransactions} 
          error="Some error" 
        />
      );

      expect(screen.queryByText(/Last \d+ transactions/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no transactions', () => {
      render(<RecentTransactionsFeed transactions={[]} />);

      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
      expect(screen.getByText(/Start tracking your finances/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Transaction/i })).toBeInTheDocument();
      
      expect(screen.queryByText(/Last \d+ transactions/)).not.toBeInTheDocument();
      expect(screen.queryByTestId('transaction-item')).not.toBeInTheDocument();
    });

    it('should show empty state icon', () => {
      render(<RecentTransactionsFeed transactions={[]} />);
      
      // Should have SVG icon for empty state
      const emptyStateIcon = screen.getByRole('img', { hidden: true });
      expect(emptyStateIcon).toBeInTheDocument();
    });
  });

  describe('State Precedence', () => {
    it('should prioritize loading state over error state', () => {
      render(
        <RecentTransactionsFeed 
          transactions={[]} 
          loading={true}
          error="Some error" 
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Failed to load recent transactions')).not.toBeInTheDocument();
    });

    it('should prioritize error state over empty state', () => {
      render(
        <RecentTransactionsFeed 
          transactions={[]} 
          error="Network error" 
        />
      );

      expect(screen.getByText('Failed to load recent transactions')).toBeInTheDocument();
      expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument();
    });

    it('should prioritize loading state over normal state', () => {
      render(
        <RecentTransactionsFeed 
          transactions={mockTransactions} 
          loading={true}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('transaction-item')).not.toBeInTheDocument();
    });
  });

  describe('Transaction Count Display', () => {
    it('should show correct count for single transaction', () => {
      render(<RecentTransactionsFeed transactions={[mockTransactions[0]]} />);
      expect(screen.getByText('Last 1 transactions')).toBeInTheDocument();
    });

    it('should show correct count for multiple transactions', () => {
      render(<RecentTransactionsFeed transactions={mockTransactions} />);
      expect(screen.getByText('Last 3 transactions')).toBeInTheDocument();
    });

    it('should not show count when transactions is empty', () => {
      render(<RecentTransactionsFeed transactions={[]} />);
      expect(screen.queryByText(/Last \d+ transactions/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<RecentTransactionsFeed transactions={mockTransactions} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Recent Transactions');
    });

    it('should have accessible button in empty state', () => {
      render(<RecentTransactionsFeed transactions={[]} />);
      
      const addButton = screen.getByRole('button', { name: /Add Transaction/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveClass('inline-flex');
    });

    it('should have proper semantic structure', () => {
      render(<RecentTransactionsFeed transactions={mockTransactions} />);
      
      // Main container should be a div with space-y-4
      const container = screen.getByText('Recent Transactions').closest('div');
      expect(container).toHaveClass('space-y-4');
    });
  });

  describe('Error Message Handling', () => {
    it('should handle null error gracefully', () => {
      render(
        <RecentTransactionsFeed 
          transactions={mockTransactions} 
          error={null}
        />
      );

      expect(screen.queryByText('Failed to load recent transactions')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('transaction-item')).toHaveLength(3);
    });

    it('should handle empty string error', () => {
      render(
        <RecentTransactionsFeed 
          transactions={[]} 
          error=""
        />
      );

      expect(screen.queryByText('Failed to load recent transactions')).not.toBeInTheDocument();
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });
});
