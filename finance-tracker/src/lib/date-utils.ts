/**
 * Date and Currency Formatting Utilities
 * Modern utilities for transaction display with relative dates and proper currency formatting
 */

export type TransactionType = 'income' | 'expense';

export interface DateFormatOptions {
  showTime?: boolean;
  format?: 'relative' | 'absolute' | 'short';
}

/**
 * Formats a date for transaction display with modern relative formatting
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatTransactionDate(
  date: Date | string,
  options: DateFormatOptions = {}
): string {
  const { format = 'relative', showTime = false } = options;
  const targetDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const targetDateOnly = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  // Handle relative format (default)
  if (format === 'relative') {
    const diffMs = targetDateOnly.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return showTime ? `Today ${formatTime(targetDate)}` : 'Today';
    } else if (diffDays === -1) {
      return showTime ? `Yesterday ${formatTime(targetDate)}` : 'Yesterday';
    } else if (diffDays === 1) {
      return showTime ? `Tomorrow ${formatTime(targetDate)}` : 'Tomorrow';
    } else if (diffDays > -7 && diffDays < 0) {
      // Within past week
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
      return showTime ? `${dayName} ${formatTime(targetDate)}` : dayName;
    }
  }

  // Format for dates outside relative range or absolute format
  const month = targetDate.toLocaleDateString('en-US', { month: 'short' });
  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const currentYear = now.getFullYear();

  if (format === 'short') {
    return `${month} ${day}`;
  }

  const dateStr = year === currentYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
  return showTime ? `${dateStr} ${formatTime(targetDate)}` : dateStr;
}

/**
 * Formats time in 12-hour format
 * @param date - The date to extract time from
 * @returns Formatted time string (e.g., "2:30 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats currency amount with modern styling and income/expense indicators
 * @param amount - The amount to format
 * @param type - Whether this is income or expense
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string with appropriate styling indicators
 */
export function formatCurrency(
  amount: number,
  type: TransactionType,
  currency: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(Math.abs(amount));
  
  // Return with appropriate prefix for display
  return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
}

/**
 * Gets the CSS classes for amount styling based on transaction type
 * @param type - Transaction type
 * @returns Tailwind CSS classes for styling
 */
export function getAmountStyleClasses(type: TransactionType): string {
  return type === 'income' 
    ? 'text-green-600 dark:text-green-400 font-semibold'
    : 'text-red-600 dark:text-red-400 font-semibold';
}

/**
 * Gets the appropriate icon for transaction type
 * @param type - Transaction type
 * @returns Icon component or string for display
 */
export function getTransactionIcon(type: TransactionType): string {
  return type === 'income' ? '↗' : '↙';
}

/**
 * Formats account name with type for display
 * @param accountName - The account name
 * @param accountType - The account type
 * @returns Formatted account display string
 */
export function formatAccountDisplay(accountName: string, accountType: string): string {
  const typeDisplayMap: Record<string, string> = {
    bank: 'Bank',
    cash: 'Cash',
    wallet: 'Wallet',
    credit_card: 'Credit Card'
  };
  
  const displayType = typeDisplayMap[accountType] || accountType;
  return `${accountName} (${displayType})`;
}

/**
 * Truncates description text for display with ellipsis
 * @param description - The description to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated description
 */
export function truncateDescription(description: string, maxLength: number = 30): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + '...';
}
