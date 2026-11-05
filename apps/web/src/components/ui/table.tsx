import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn(
          'w-full text-left text-sm [&_th]:px-3 [&_th]:py-3 [&_th]:font-medium [&_td]:px-3 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-[var(--border)]',
          className,
        )}
        {...props}
      />
    </div>
  );
}
