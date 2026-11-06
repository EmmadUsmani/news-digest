import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

export function Card({
  as: Component = 'div',
  className,
  ...props
}: ComponentProps<'div'> & { as?: 'div' | 'article' }) {
  return (
    <Component
      data-slot="card"
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
