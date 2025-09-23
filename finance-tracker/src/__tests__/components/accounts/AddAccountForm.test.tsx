import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddAccountForm from '@/components/accounts/AddAccountForm';
import { Account } from '@/types/account';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AddAccountForm', () => {
  const mockOnAccountAdded = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders form fields correctly', () => {
    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Account Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Type')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows validation error for invalid name', async () => {
    const user = userEvent.setup();
    
    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Account Name');
    const submitButton = screen.getByText('Create Account');

    await user.type(nameInput, 'A'); // Too short
    await user.click(submitButton);

    expect(screen.getByText('Account name must be between 2 and 50 characters')).toBeInTheDocument();
  });

  it('successfully creates account', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: 'account-123',
      name: 'Test Bank',
      type: 'bank',
      balance: 0,
      created_at: '2023-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Account Name');
    const typeSelect = screen.getByLabelText('Account Type');
    const submitButton = screen.getByText('Create Account');

    await user.type(nameInput, 'Test Bank');
    await user.selectOptions(typeSelect, 'bank');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Bank',
          type: 'bank',
        }),
      });
    });

    expect(mockOnAccountAdded).toHaveBeenCalledWith({
      id: 'account-123',
      user_id: '',
      name: 'Test Bank',
      type: 'bank',
      balance: 0,
      created_at: '2023-01-01T00:00:00Z',
    });
  });

  it('handles API error', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Account creation failed' }),
    });

    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Account Name');
    const submitButton = screen.getByText('Create Account');

    await user.type(nameInput, 'Test Bank');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account creation failed')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();

    // Make fetch hang to simulate loading
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Account Name');
    const submitButton = screen.getByText('Create Account');

    await user.type(nameInput, 'Test Bank');
    await user.click(submitButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('updates account type description when selection changes', async () => {
    const user = userEvent.setup();

    render(
      <AddAccountForm
        onAccountAdded={mockOnAccountAdded}
        onCancel={mockOnCancel}
      />
    );

    const typeSelect = screen.getByLabelText('Account Type');

    await user.selectOptions(typeSelect, 'cash');
    expect(screen.getByText('Physical cash holdings')).toBeInTheDocument();

    await user.selectOptions(typeSelect, 'wallet');
    expect(screen.getByText('Digital wallets, mobile money, etc.')).toBeInTheDocument();

    await user.selectOptions(typeSelect, 'credit_card');
    expect(screen.getByText('Credit card accounts')).toBeInTheDocument();
  });
});
