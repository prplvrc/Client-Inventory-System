import type { ComponentProps } from "react";

type SkeletonProps = ComponentProps<"div">;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-gray-200/80 ${className}`} {...props} />;
}

export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-label="Loading row" className="animate-pulse">
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className="px-4 py-3">
              <Skeleton className={column === 0 ? "h-3 w-12" : "h-3 w-full min-w-16"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-label="Loading content" role="status">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
