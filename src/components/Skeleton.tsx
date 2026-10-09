interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
}

interface SkeletonGridProps {
  count?: number
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28" />
      ))}
    </div>
  )
}

interface SkeletonRowsProps {
  rows?: number
  columns?: number
}

export function SkeletonRows({ rows = 6, columns = 5 }: SkeletonRowsProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((__, column) => (
            <Skeleton key={column} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  )
}
