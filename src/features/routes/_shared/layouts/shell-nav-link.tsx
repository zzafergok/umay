'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Link } from '@/components/core/link';

export interface ShellNavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * Navigation link that ensures same-page `/#anchor` clicks always scroll
 * to the target section, even when the hash is already active in the URL.
 */
export function ShellNavLink({ href, className, children }: ShellNavLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const targetPath = href.slice(0, hashIndex) || '/';
    const targetId = href.slice(hashIndex + 1);
    if (!targetId || typeof window === 'undefined') return;

    if (window.location.pathname !== targetPath) return;

    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    targetEl.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    const nextHash = `#${targetId}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', `${targetPath}${nextHash}`);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
