import AccountSkeleton from './AccountSkeleton';

interface AccountsLoadingSkeletonProps {
  count?: number;
}

export default function AccountsLoadingSkeleton({ count = 3 }: AccountsLoadingSkeletonProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <AccountSkeleton key={index} />
      ))}
    </div>
  );
}
