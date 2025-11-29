import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component provides animated loading placeholders
 * Supports different shapes and sizes for various UI elements
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/**
 * SkeletonText component for text loading states
 */
function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
}

/**
 * SkeletonAvatar component for avatar loading states
 */
function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />;
}

/**
 * SkeletonCard component for card loading states
 */
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & SkeletonProps) {
  return (
    <div className={cn('rounded-lg border p-4 space-y-3', className)} {...props}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

/**
 * SkeletonTable component for table loading states
 */
function SkeletonTable({ rows = 5, cols = 4, className, ...props }: React.HTMLAttributes<HTMLDivElement> & SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable };
