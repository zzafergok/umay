import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import * as React from 'react';

import { type VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/core/button';

import { cn } from '@/lib/utils';

export interface LinkProps
  extends
    NextLinkProps,
    VariantProps<typeof buttonVariants>,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> {}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <NextLink
        className={cn(
          variant || size
            ? buttonVariants({ variant, size })
            : 'focus-visible:ring-offset-bg rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Link.displayName = 'Link';

export { Link };
