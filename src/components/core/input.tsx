'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.ComponentProps<'input'> & {
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        aria-invalid={error ? true : props['aria-invalid']}
        className={cn(
          'flex h-10 min-h-[40px] w-full min-w-0 rounded-md border border-border bg-surface-sunken px-3 py-1.5 text-body-sm text-text outline-none transition-colors duration-150 md:h-9 md:min-h-[36px]',
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-text',
          'placeholder:text-text-subtle',
          'focus-visible:border-accent',
          'aria-invalid:border-danger',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
