import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@client/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
      orange:
        'bg-orange-50/80 text-orange-800 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/40',
      blue: 'bg-blue-50/80 text-blue-800 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40',
      pink: 'bg-pink-50/80 text-pink-800 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/40',
      red: 'bg-red-50/80 text-red-800 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
      emerald:
        'bg-emerald-50/80 text-emerald-800 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
      outline: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
