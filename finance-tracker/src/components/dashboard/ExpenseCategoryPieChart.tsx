/**
 * Expense Category Pie Chart Component
 * Modern pie chart using Recharts with interactive features
 */

'use client';

import { useMemo } from 'react';
import { formatCurrency, formatPercentage, type CategoryExpense } from '@/lib/chart-utils';
import ChartContainer from '@/components/ui/chart-container';

interface ExpenseCategoryPieChartProps {
  data: CategoryExpense[];
  loading?: boolean;
  error?: string | null;
}

// Placeholder component until Recharts is installed
function PlaceholderChart({ data }: { data: CategoryExpense[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-2">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            No expense data for this month
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Start adding expenses to see your spending breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {item.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs ml-auto">
              {formatPercentage(item.percentage)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Placeholder for actual chart */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-32 h-32 mx-auto rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Chart will appear here<br />
              when Recharts is installed
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total: {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseCategoryPieChart({
  data,
  loading = false,
  error = null,
}: ExpenseCategoryPieChartProps) {
  const chartDescription = useMemo(() => {
    if (data.length === 0) return 'No expenses recorded this month';
    
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const categoryCount = data.length;
    
    return `${formatCurrency(totalAmount)} across ${categoryCount} ${
      categoryCount === 1 ? 'category' : 'categories'
    }`;
  }, [data]);

  return (
    <ChartContainer
      title="Expenses by Category"
      description={chartDescription}
      loading={loading}
      error={error}
      className="min-h-96"
    >
      <PlaceholderChart data={data} />
    </ChartContainer>
  );
}

export default ExpenseCategoryPieChart;
