'use client'

export function TransactionListSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header skeleton */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
      </div>

      {/* Desktop Table View Skeleton */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse ml-auto"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View Skeleton */}
      <div className="md:hidden">
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              
              <div className="mb-3">
                <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                <div className="text-right">
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse ml-auto"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
