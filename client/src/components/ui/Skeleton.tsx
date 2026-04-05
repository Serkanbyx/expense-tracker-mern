import type React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonProps['variant'] & string, string> = {
  rectangular: 'rounded',
  circular: 'rounded-full',
  text: 'rounded h-4 w-full',
};

const Skeleton = ({ variant = 'rectangular', className = '', ...props }: SkeletonProps) => (
  <div
    className={`animate-pulse bg-gray-200 ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  />
);

/* ── Composed Skeletons ─────────────────────────────── */

const SummaryCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10" />
      <Skeleton variant="text" className="h-4 w-24" />
    </div>
    <Skeleton className="mt-4 h-8 w-32" />
  </div>
);

const ChartSkeleton = ({ circle = false }: { circle?: boolean }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <Skeleton variant="text" className="mb-6 h-5 w-48" />
    {circle ? (
      <div className="flex items-center justify-center">
        <Skeleton variant="circular" className="h-64 w-64" />
      </div>
    ) : (
      <Skeleton className="h-72 w-full" />
    )}
  </div>
);

const TableRowSkeleton = () => (
  <tr>
    <td className="px-4 py-3">
      <Skeleton variant="text" className="h-4 w-24" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="circular" className="h-5 w-16" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="circular" className="h-5 w-20" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="text" className="h-4 w-36" />
    </td>
    <td className="px-4 py-3 text-right">
      <Skeleton className="ml-auto h-4 w-24" />
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
);

const MobileCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="h-4 w-24" />
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="mt-3 flex gap-2">
      <Skeleton variant="circular" className="h-5 w-16" />
      <Skeleton variant="circular" className="h-5 w-20" />
    </div>
    <Skeleton variant="text" className="mt-3 h-4 w-full" />
    <div className="mt-3 flex justify-end gap-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

const ListRowSkeleton = () => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <Skeleton variant="text" className="h-4 w-20" />
      <Skeleton variant="circular" className="h-5 w-16" />
      <Skeleton variant="text" className="h-4 w-32" />
    </div>
    <Skeleton className="h-5 w-20" />
  </div>
);

export default Skeleton;
export {
  Skeleton,
  SummaryCardSkeleton,
  ChartSkeleton,
  TableRowSkeleton,
  MobileCardSkeleton,
  ListRowSkeleton,
};
