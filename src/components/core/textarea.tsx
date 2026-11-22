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
          'flex min-h-24 w-full rounded-md border border-border bg-surface-sunken px-3 py-2 text-body text-text outline-none transition-colors duration-150',
          'placeholder:text-text-subtle',
          'focus-visible:border-accent',
          'aria-invalid:border-danger',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
