interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-charcoal-text/10 rounded ${className}`}
      style={style}
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-28 ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>
      <div className="h-48 flex items-end gap-2 pt-4">
        {[45, 60, 35, 75, 50, 85].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <Skeleton className="w-full rounded-t-xl" style={{ height: `${h}%` }} />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-24 rounded-2xl" />
        <Skeleton className="flex-1 h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full md:w-64 rounded-2xl" />
    </div>
  );
}
