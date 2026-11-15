'use client';

import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { Separator } from '@/components/core/separator';
import { UmayMark } from '@/components/shared/umay-brand';
import type { PublicHomeCopy } from '../types';

export interface HomeFooterCtaProps {
  footerCta: PublicHomeCopy['footerCta'];
  onNavigateTab?: (href: string) => void;
}

export function HomeFooterCta({
  footerCta,
  onNavigateTab,
}: HomeFooterCtaProps) {
  return (
    <footer className="space-y-4 pb-2 sm:space-y-6 sm:pb-4">
      <Separator />
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <UmayMark className="h-5 w-5" />
          <span className="text-text-muted text-xs">
            Umay · Home &amp; Personal Inventory
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          {footerCta.navLinks.map((anchor) =>
            onNavigateTab ? (
              <Button
                key={anchor.href}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab(anchor.href)}
                className="text-text-muted hover:text-text h-7 px-2 text-xs"
              >
                {anchor.label}
              </Button>
            ) : (
              <Link
                key={anchor.href}
                href={anchor.href}
                className="text-text-muted hover:text-text px-1.5 py-1 text-xs transition-colors"
              >
                {anchor.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
