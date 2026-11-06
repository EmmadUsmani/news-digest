import { Card } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';

export function ReaderSkeleton() {
  return (
    <div role="status" className="reader-skeleton pt-20 lg:pt-10">
      <span className="sr-only">Loading edition…</span>
      <div aria-hidden="true" className="flex gap-6">
        <div className="hidden w-60 shrink-0 space-y-5 lg:block">
          <Skeleton className="mb-8 h-3 w-20" />
          {[32, 24, 36, 28].map((width) => (
            <Skeleton
              key={width}
              className="h-4"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
        <div className="min-w-0 max-w-2xl flex-1">
          <Skeleton className="h-7 w-40" />
          <div className="my-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <Card key={index} className="rounded-lg p-5 shadow-none">
                <Skeleton className="h-6 w-5/6" />
                <div className="my-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <Skeleton className="h-3 w-1/3" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
