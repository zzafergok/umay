import * as React from 'react';
import { cn } from '@/lib/utils';

export interface UmayMarkProps {
  className?: string;
}

/**
 * Umay brand mark: geometric house silhouette in --text with hearth flame in --ember.
 */
export function UmayMark({ className }: UmayMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('h-6 w-6 shrink-0', className)}
    >
      <path
        d="M4 10.75C4 9.75 4.48 8.81 5.29 8.23L10.89 4.23C11.55 3.76 12.45 3.76 13.11 4.23L18.71 8.23C19.52 8.81 20 9.75 20 10.75V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V10.75Z"
        className="stroke-text"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5C13.25 12.1 14 13.35 14 14.55C14 15.68 13.1 16.5 12 16.5C10.9 16.5 10 15.68 10 14.55C10 13.35 10.75 12.1 12 10.5Z"
        className="fill-ember"
      />
    </svg>
  );
}

export function UmayEmptyIllustration({ className }: UmayMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn('h-24 w-24 shrink-0', className)}
    >
      <path
        d="M24 54C24 49 26.4 44.3 30.4 41.4L55 23.8C58 21.6 62 21.6 65 23.8L89.6 41.4C93.6 44.3 96 49 96 54V88C96 93.5 91.5 98 86 98H34C28.5 98 24 93.5 24 88V54Z"
        className="stroke-text-muted"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 74H78"
        className="stroke-border-strong"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 48C64.2 53.5 67 57.6 67 61.6C67 65.4 63.9 68.5 60 68.5C56.1 68.5 53 65.4 53 61.6C53 57.6 55.8 53.5 60 48Z"
        className="fill-ember"
      />
    </svg>
  );
}
