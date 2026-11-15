'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.ComponentProps<'textarea'> & {
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        aria-invalid={error ? true : props['aria-invalid']}
        className={cn(
          'bg-surface-sunken text-body text-text flex min-h-24 w-full rounded-md border border-border px-3 py-2 outline-none transition-colors duration-150',
          'placeholder:text-text-subtle',
          'focus-visible:ring-offset-bg focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:ring-danger',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
