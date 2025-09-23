import { Skeleton } from "@/components/ui/skeleton";

export default function AccountSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Account Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Account type icon */}
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            {/* Account name */}
            <Skeleton className="h-5 w-32" />
            {/* Account type */}
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Account Details */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}
