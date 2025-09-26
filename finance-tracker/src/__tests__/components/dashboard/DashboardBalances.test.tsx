import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardBalances } from '@/components/dashboard/DashboardBalances';

// Mock fetch
global.fetch = jest.fn();

describe('DashboardBalances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDashboardStats = {
    totalBalance: 1850,
    accountBalances: [
      {
        accountId: 'acc1',
        accountName: 'Checking Account',
        accountType: 'bank',
        balance: 1000
      },
      {
        accountId: 'acc2',
        accountName: 'Cash Wallet',
        accountType: 'cash',
        balance: 850
      }
    ]
  };

  it('displays loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DashboardBalances />);
    
    expect(screen.getAllByRole('generic')).toHaveLength(4); // Loading skeletons
  });

  it('displays dashboard stats after successful fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardStats
    });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('$1,850.00')).toBeInTheDocument();
    });

    expect(screen.getByText('Across 2 accounts')).toBeInTheDocument();
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
    expect(screen.getByText('Cash Wallet')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('$850.00')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('displays error state when API returns error status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch dashboard stats: 500')).toBeInTheDocument();
  });

  it('allows retry after error', async () => {
    // First call fails
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      // Second call succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardStats
      });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('$1,850.00')).toBeInTheDocument();
    });
  });

  it('displays empty state when no accounts exist', async () => {
    const emptyStats = {
      totalBalance: 0,
      accountBalances: []
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => emptyStats
    });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    expect(screen.getByText('No Accounts Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first account to start tracking your finances.')).toBeInTheDocument();
    expect(screen.getByText('Add Account')).toBeInTheDocument();
  });

  it('displays correct singular account text for one account', async () => {
    const singleAccountStats = {
      totalBalance: 500,
      accountBalances: [
        {
          accountId: 'acc1',
          accountName: 'Checking Account',
          accountType: 'bank',
          balance: 500
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => singleAccountStats
    });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('Across 1 account')).toBeInTheDocument();
    });
  });

  it('provides refresh functionality', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardStats
    });

    render(<DashboardBalances />);
    
    await waitFor(() => {
      expect(screen.getByText('$1,850.00')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('applies custom className', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    const { container } = render(<DashboardBalances className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
