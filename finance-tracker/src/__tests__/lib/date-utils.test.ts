/**
 * Unit tests for date and currency formatting utilities
 */
import {
  formatTransactionDate,
  formatCurrency,
  getAmountStyleClasses,
  getTransactionIcon,
  formatAccountDisplay,
  truncateDescription,
  type TransactionType
} from '../../lib/date-utils';

describe('formatTransactionDate', () => {
  const mockNow = new Date('2025-01-15T12:00:00Z');
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should format today\'s date correctly', () => {
    const today = new Date('2025-01-15T09:30:00Z');
    expect(formatTransactionDate(today)).toBe('Today');
    expect(formatTransactionDate(today, { showTime: true })).toBe('Today 9:30 AM');
  });

  it('should format yesterday\'s date correctly', () => {
    const yesterday = new Date('2025-01-14T15:45:00Z');
    expect(formatTransactionDate(yesterday)).toBe('Yesterday');
    expect(formatTransactionDate(yesterday, { showTime: true })).toBe('Yesterday 3:45 PM');
  });

  it('should format tomorrow\'s date correctly', () => {
    const tomorrow = new Date('2025-01-16T10:00:00Z');
    expect(formatTransactionDate(tomorrow)).toBe('Tomorrow');
  });

  it('should format dates within the past week with day names', () => {
    const lastMonday = new Date('2025-01-13T14:20:00Z'); // 2 days ago
    expect(formatTransactionDate(lastMonday)).toBe('Monday');
  });

  it('should format older dates with month and day', () => {
    const oldDate = new Date('2025-01-01T10:00:00Z');
    expect(formatTransactionDate(oldDate)).toBe('Jan 1');
  });

  it('should include year for dates from different years', () => {
    const lastYear = new Date('2024-12-25T10:00:00Z');
    expect(formatTransactionDate(lastYear)).toBe('Dec 25, 2024');
  });

  it('should handle absolute format', () => {
    const date = new Date('2025-01-10T10:00:00Z');
    expect(formatTransactionDate(date, { format: 'absolute' })).toBe('Jan 10');
  });

  it('should handle short format', () => {
    const date = new Date('2025-01-10T10:00:00Z');
    expect(formatTransactionDate(date, { format: 'short' })).toBe('Jan 10');
  });

  it('should handle string dates', () => {
    expect(formatTransactionDate('2025-01-15')).toBe('Today');
  });
});

describe('formatCurrency', () => {
  it('should format income amounts with plus sign', () => {
    expect(formatCurrency(100.50, 'income')).toBe('+$100.50');
    expect(formatCurrency(1234.56, 'income')).toBe('+$1,234.56');
  });

  it('should format expense amounts with minus sign', () => {
    expect(formatCurrency(75.25, 'expense')).toBe('-$75.25');
    expect(formatCurrency(999.99, 'expense')).toBe('-$999.99');
  });

  it('should handle zero amounts', () => {
    expect(formatCurrency(0, 'income')).toBe('+$0.00');
    expect(formatCurrency(0, 'expense')).toBe('-$0.00');
  });

  it('should handle negative input amounts correctly', () => {
    expect(formatCurrency(-50, 'expense')).toBe('-$50.00');
    expect(formatCurrency(-25, 'income')).toBe('+$25.00');
  });

  it('should handle different currencies', () => {
    expect(formatCurrency(100, 'income', 'EUR')).toBe('+€100.00');
    expect(formatCurrency(100, 'expense', 'GBP')).toBe('-£100.00');
  });

  it('should format large amounts with proper separators', () => {
    expect(formatCurrency(1000000, 'income')).toBe('+$1,000,000.00');
  });
});

describe('getAmountStyleClasses', () => {
  it('should return green classes for income', () => {
    const classes = getAmountStyleClasses('income');
    expect(classes).toContain('text-green-600');
    expect(classes).toContain('dark:text-green-400');
    expect(classes).toContain('font-semibold');
  });

  it('should return red classes for expense', () => {
    const classes = getAmountStyleClasses('expense');
    expect(classes).toContain('text-red-600');
    expect(classes).toContain('dark:text-red-400');
    expect(classes).toContain('font-semibold');
  });
});

describe('getTransactionIcon', () => {
  it('should return up arrow for income', () => {
    expect(getTransactionIcon('income')).toBe('↗');
  });

  it('should return down arrow for expense', () => {
    expect(getTransactionIcon('expense')).toBe('↙');
  });
});

describe('formatAccountDisplay', () => {
  it('should format bank accounts correctly', () => {
    expect(formatAccountDisplay('Chase Checking', 'bank')).toBe('Chase Checking (Bank)');
  });

  it('should format cash accounts correctly', () => {
    expect(formatAccountDisplay('Wallet', 'cash')).toBe('Wallet (Cash)');
  });

  it('should format credit card accounts correctly', () => {
    expect(formatAccountDisplay('Visa Card', 'credit_card')).toBe('Visa Card (Credit Card)');
  });

  it('should handle unknown account types', () => {
    expect(formatAccountDisplay('Investment', 'investment')).toBe('Investment (investment)');
  });
});

describe('truncateDescription', () => {
  it('should not truncate short descriptions', () => {
    const short = 'Coffee at Starbucks';
    expect(truncateDescription(short)).toBe(short);
  });

  it('should truncate long descriptions with default length', () => {
    const long = 'This is a very long transaction description that should be truncated';
    const result = truncateDescription(long);
    expect(result).toBe('This is a very long transac...');
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it('should truncate with custom length', () => {
    const description = 'Medium length description';
    const result = truncateDescription(description, 10);
    expect(result).toBe('Medium l...');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should handle edge cases', () => {
    expect(truncateDescription('', 10)).toBe('');
    expect(truncateDescription('abc', 3)).toBe('abc');
    expect(truncateDescription('abcd', 3)).toBe('...');
  });
});
