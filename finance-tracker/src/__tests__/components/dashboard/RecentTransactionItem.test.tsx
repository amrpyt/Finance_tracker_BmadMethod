/**
 * Unit tests for RecentTransactionItem component
 */
import { render, screen } from '@testing-library/react';
import { RecentTransactionItem } from '../../../components/dashboard/RecentTransactionItem';
import { RecentTransaction } from '../../../lib/dashboard';

const mockIncomeTransaction: RecentTransaction = {
  id: 'tx-income-1',
  amount: 1500,
  type: 'income',
  category: 'Salary',
  description: 'Monthly salary payment',
  date: new Date('2025-01-15T09:00:00Z'),
  accountName: 'Chase Checking',
  accountType: 'bank'
};

const mockExpenseTransaction: RecentTransaction = {
  id: 'tx-expense-1',
  amount: 85.50,
  type: 'expense',
  category: 'Food & Dining',
  description: 'Lunch at Italian restaurant with colleagues',
  date: new Date('2025-01-14T12:30:00Z'),
  accountName: 'Cash Wallet',
  accountType: 'cash'
};

// Mock the date utilities to ensure consistent test results
jest.mock('../../../lib/date-utils', () => ({
  formatTransactionDate: jest.fn(() => 'Today'),
  formatCurrency: jest.fn((amount, type) => type === 'income' ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`),
  getAmountStyleClasses: jest.fn((type) => 
    type === 'income' 
      ? 'text-green-600 dark:text-green-400 font-semibold'
      : 'text-red-600 dark:text-red-400 font-semibold'
  ),
  getTransactionIcon: jest.fn((type) => type === 'income' ? '↗' : '↙'),
  formatAccountDisplay: jest.fn((name, type) => `${name} (${type})`),
  truncateDescription: jest.fn((desc) => desc.length > 25 ? desc.substring(0, 22) + '...' : desc)
}));

describe('RecentTransactionItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Income Transaction Display', () => {
    it('should render income transaction with correct styling', () => {
      render(<RecentTransactionItem transaction={mockIncomeTransaction} />);

      // Check transaction description
      expect(screen.getByText('Monthly salary payment')).toBeInTheDocument();

      // Check category badge
      expect(screen.getByText('Salary')).toBeInTheDocument();

      // Check account information
      expect(screen.getByText('Chase Checking (bank)')).toBeInTheDocument();

      // Check amount formatting
      expect(screen.getByText('+$1500.00')).toBeInTheDocument();

      // Check date formatting
      expect(screen.getByText('Today')).toBeInTheDocument();

      // Check income icon
      expect(screen.getByText('↗')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for income', () => {
      const { container } = render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      
      const amountElement = screen.getByText('+$1500.00');
      expect(amountElement).toHaveClass('text-green-600', 'dark:text-green-400', 'font-semibold');

      const iconContainer = container.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Expense Transaction Display', () => {
    it('should render expense transaction with correct styling', () => {
      render(<RecentTransactionItem transaction={mockExpenseTransaction} />);

      // Check truncated description
      expect(screen.getByText('Lunch at Italian resta...')).toBeInTheDocument();

      // Check category badge
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();

      // Check account information
      expect(screen.getByText('Cash Wallet (cash)')).toBeInTheDocument();

      // Check amount formatting
      expect(screen.getByText('-$85.50')).toBeInTheDocument();

      // Check expense icon
      expect(screen.getByText('↙')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for expense', () => {
      const { container } = render(<RecentTransactionItem transaction={mockExpenseTransaction} />);
      
      const amountElement = screen.getByText('-$85.50');
      expect(amountElement).toHaveClass('text-red-600', 'dark:text-red-400', 'font-semibold');

      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Account Display Control', () => {
    it('should show account information by default', () => {
      render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      expect(screen.getByText('Chase Checking (bank)')).toBeInTheDocument();
    });

    it('should hide account information when showAccount is false', () => {
      render(<RecentTransactionItem transaction={mockIncomeTransaction} showAccount={false} />);
      expect(screen.queryByText('Chase Checking (bank)')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper responsive classes for mobile/desktop', () => {
      const { container } = render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      
      // Main container should have responsive flex layout
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-between');
      
      // Description should truncate on small screens
      const description = screen.getByText('Monthly salary payment');
      expect(description.closest('.min-w-0')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('should have hover transition classes', () => {
      const { container } = render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('group', 'hover:border-gray-300', 'hover:shadow-md', 'transition-all');
      
      // Icon should have hover scale effect
      const iconContainer = container.querySelector('.group-hover\\:scale-105');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      
      const icon = screen.getByText('↗');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have semantic structure', () => {
      render(<RecentTransactionItem transaction={mockIncomeTransaction} />);
      
      // Description should be in a paragraph
      const description = screen.getByText('Monthly salary payment');
      expect(description.tagName).toBe('P');
      
      // Category should be in a span with proper styling
      const category = screen.getByText('Salary');
      expect(category.tagName).toBe('SPAN');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long descriptions', () => {
      const longDescriptionTransaction = {
        ...mockIncomeTransaction,
        description: 'This is a very long transaction description that should definitely be truncated'
      };
      
      render(<RecentTransactionItem transaction={longDescriptionTransaction} />);
      
      // Should call truncate function
      expect(require('../../../lib/date-utils').truncateDescription).toHaveBeenCalledWith(
        'This is a very long transaction description that should definitely be truncated'
      );
    });

    it('should handle zero amounts', () => {
      const zeroAmountTransaction = {
        ...mockIncomeTransaction,
        amount: 0
      };
      
      render(<RecentTransactionItem transaction={zeroAmountTransaction} />);
      expect(screen.getByText('+$0.00')).toBeInTheDocument();
    });

    it('should handle different account types', () => {
      const creditCardTransaction = {
        ...mockExpenseTransaction,
        accountName: 'Visa Card',
        accountType: 'credit_card'
      };
      
      render(<RecentTransactionItem transaction={creditCardTransaction} />);
      expect(screen.getByText('Visa Card (credit_card)')).toBeInTheDocument();
    });
  });
});
