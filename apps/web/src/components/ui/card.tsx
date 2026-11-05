import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
