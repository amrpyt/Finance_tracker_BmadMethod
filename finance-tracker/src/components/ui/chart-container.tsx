/**
 * Reusable chart container component
 * Provides consistent styling and error handling for all charts
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  description?: string;
}

export function ChartContainer({
  title,
  children,
  loading = false,
  error = null,
  className = '',
  description,
}: ChartContainerProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {error ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div className="space-y-2">
              <div className="text-red-500 dark:text-red-400 text-sm font-medium">
                Error loading chart
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                {error}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="space-y-4 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading chart data...
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartContainer;
