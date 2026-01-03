import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <LoadingSkeleton className="h-4 w-24 mb-4" />
      <LoadingSkeleton className="h-8 w-32" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

