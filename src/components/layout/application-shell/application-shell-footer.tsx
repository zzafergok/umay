'use client';

import type { ApplicationShellFooterProps } from './types';

export function ApplicationShellFooter({
  children,
  placement,
  collapsed = false,
}: ApplicationShellFooterProps) {
  return (
    <footer
      className={`flex shrink-0 items-center justify-center border-t border-border ${
        placement === 'sidebar'
          ? collapsed
            ? 'h-auto min-h-16 px-2 py-3'
            : 'h-16 px-3 sm:px-4'
          : 'text-text-muted min-h-14 px-4 py-3 pb-[calc(6rem+env(safe-area-inset-bottom))] text-center text-caption md:min-h-16 md:pb-3'
      }`}
    >
      {children}
    </footer>
  );
}
