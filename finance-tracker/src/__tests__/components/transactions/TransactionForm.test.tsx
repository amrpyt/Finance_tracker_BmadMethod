import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '../../../components/transactions';
import { Account } from '../../../types/account';
import { Transaction } from '../../../types/transaction';

// Mock fetch
global.fetch = jest.fn();

const mockAccounts: Account[] = [
  {
    id: 'account-1',
    user_id: 'user-1',
    name: 'Main Checking',
    type: 'bank',
    balance: 1500.00,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'account-2',
    user_id: 'user-1',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 250.00,
    created_at: '2023-01-15T00:00:00Z'
  }
];

const mockTransaction: Transaction = {
  id: 'transaction-1',
  userId: 'user-1',
  accountId: 'account-1',
  amount: 25.99,
  type: 'expense',
  category: 'Food',
  description: 'Lunch at restaurant',
  date: '2023-12-01',
  createdAt: '2023-12-01T12:00:00Z'
};

describe('TransactionForm', () => {
  const mockOnTransactionAdded = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders transaction form with all required fields', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Account')).toBeInTheDocument();
    expect(screen.getByText('Transaction Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (EGP)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('displays account options with balances', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const accountSelect = screen.getByLabelText('Account');
    expect(accountSelect).toHaveValue('account-1'); // Should default to first account
    
    fireEvent.click(accountSelect);
    
    expect(screen.getByText(/Main Checking \(Balance: 1500.00\)/)).toBeInTheDocument();
    expect(screen.getByText(/Cash Wallet \(Balance: 250.00\)/)).toBeInTheDocument();
  });

  it('defaults to expense type and shows expense categories', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const expenseButton = screen.getByText('Expense').closest('button');
    expect(expenseButton).toHaveClass('bg-red-100', 'text-red-700', 'border-red-300');

    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toHaveValue('Food'); // Default expense category
  });

  it('changes categories when transaction type changes', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const incomeButton = screen.getByText('Income').closest('button');
    fireEvent.click(incomeButton!);

    await waitFor(() => {
      const categorySelect = screen.getByLabelText('Category');
      expect(categorySelect).toHaveValue('Salary'); // Default income category
    });

    expect(incomeButton).toHaveClass('bg-green-100', 'text-green-700', 'border-green-300');
  });

  it('validates required fields', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be a positive number')).toBeInTheDocument();
      expect(screen.getByText('Description must be between 3 and 100 characters')).toBeInTheDocument();
    });
  });

  it('validates amount is positive', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const amountInput = screen.getByLabelText('Amount (EGP)');
    fireEvent.change(amountInput, { target: { value: '-10' } });

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be a positive number')).toBeInTheDocument();
    });
  });

  it('validates description length', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByLabelText('Description');
    
    // Too short
    fireEvent.change(descriptionInput, { target: { value: 'ab' } });
    
    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description must be between 3 and 100 characters')).toBeInTheDocument();
    });

    // Too long
    fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(101) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description must be between 3 and 100 characters')).toBeInTheDocument();
    });
  });

  it('prevents future dates', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByLabelText('Date');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    fireEvent.change(dateInput, { 
      target: { value: futureDate.toISOString().split('T')[0] } 
    });

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a valid date (not in the future)')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockResponse = {
      transaction: mockTransaction,
      updatedAccountBalance: 1474.01
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Amount (EGP)'), { target: { value: '25.99' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Lunch at restaurant' } });

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: 'account-1',
          amount: 25.99,
          type: 'expense',
          category: 'Food',
          description: 'Lunch at restaurant',
          date: expect.any(String),
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnTransactionAdded).toHaveBeenCalledWith(mockTransaction, 1474.01);
    });
  });

  it('handles API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Account not found' })
    });

    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Amount (EGP)'), { target: { value: '25.99' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test transaction' } });

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account not found')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    // Mock a delayed response
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ transaction: mockTransaction, updatedAccountBalance: 1474.01 })
      }), 100))
    );

    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Amount (EGP)'), { target: { value: '25.99' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test transaction' } });

    const submitButton = screen.getByText(/Add Expense/);
    fireEvent.click(submitButton);

    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form when no accounts available', () => {
    render(
      <TransactionForm
        accounts={[]}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText(/Add Expense/);
    expect(submitButton).toBeDisabled();
  });

  it('uses defaultAccountId when provided', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
        defaultAccountId="account-2"
      />
    );

    const accountSelect = screen.getByLabelText('Account');
    expect(accountSelect).toHaveValue('account-2');
  });

  it('shows character count for description', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        onTransactionAdded={mockOnTransactionAdded}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    expect(screen.getByText('4/100 characters')).toBeInTheDocument();
  });
});
