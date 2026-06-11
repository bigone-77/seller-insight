import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// 범용 skeleton primitive (shadcn식). pulse + 라운드, className 병합으로 크기/색 조정.
function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
