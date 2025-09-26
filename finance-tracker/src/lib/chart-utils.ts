/**
 * Chart utilities for Finance Tracker
 * Provides color palettes, formatting functions, and chart helpers
 */

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

/**
 * Modern, accessible color palette for pie charts
 * Colors chosen for high contrast and color-blind friendliness
 */
export const CHART_COLORS = [
  '#0ea5e9', // Sky blue
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#f97316', // Orange
  '#06b6d4', // Cyan
] as const;

/**
 * Get color for a category with consistent assignment
 */
export function getCategoryColor(category: string, index: number): string {
  // Use index to ensure consistent colors across renders
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Format currency amount with proper locale and currency symbol
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

/**
 * Format percentage with one decimal place
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Calculate percentage breakdown for expense categories
 */
export function calculateCategoryPercentages(
  categoryTotals: Record<string, { amount: number; count: number }>
): CategoryExpense[] {
  const totalAmount = Object.values(categoryTotals).reduce(
    (sum, { amount }) => sum + amount, 
    0
  );

  if (totalAmount === 0) {
    return [];
  }

  return Object.entries(categoryTotals)
    .map(([category, { amount, count }], index) => ({
      category,
      amount,
      percentage: (amount / totalAmount) * 100,
      color: getCategoryColor(category, index),
      transactionCount: count,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

/**
 * Filter transactions for current month
 */
export function getCurrentMonthDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return (
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth()
  );
}

/**
 * Generate custom tooltip content for pie chart
 */
export function formatTooltipContent(
  category: string,
  amount: number,
  percentage: number,
  transactionCount?: number
): string {
  const formattedAmount = formatCurrency(amount);
  const formattedPercentage = formatPercentage(percentage);
  const countText = transactionCount ? ` (${transactionCount} transactions)` : '';
  
  return `${category}: ${formattedAmount} (${formattedPercentage})${countText}`;
}
