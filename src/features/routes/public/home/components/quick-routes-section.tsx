'use client';

import {
  ArrowUpRight,
  History,
  LayoutDashboard,
  Lock,
  MapPin,
  Package,
  ScanLine,
  ShoppingCart,
  Tags,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Card } from '@/components/core/card';
import { Link } from '@/components/core/link';
import type { PublicHomeCopy, QuickRouteIconKey } from '../types';

export interface QuickRoutesSectionProps {
  quickRoutesSection: PublicHomeCopy['quickRoutesSection'];
  onRequireSignIn?: () => void;
}

const ROUTE_ICON_MAP: Record<QuickRouteIconKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  package: Package,
  wrench: Wrench,
  shopping: ShoppingCart,
  mapPin: MapPin,
  tags: Tags,
  scan: ScanLine,
  history: History,
};

export function QuickRoutesSection({
  quickRoutesSection,
  onRequireSignIn,
}: QuickRoutesSectionProps) {
  return (
    <section id="ekranlar" className="scroll-mt-20 space-y-4 sm:space-y-6">
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline">{quickRoutesSection.badge}</Badge>
        <h2 className="text-xl font-semibold tracking-tight text-text sm:text-3xl">
          {quickRoutesSection.title}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted sm:text-base">
          {quickRoutesSection.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
        {quickRoutesSection.routes.map((route) => {
          const Icon = ROUTE_ICON_MAP[route.icon];

          return (
            <Link
              key={route.id}
              href="#hero"
              onClick={() => onRequireSignIn?.()}
              className="group block h-full"
            >
              <Card
                interactive
                className="flex h-full flex-col justify-between border-border p-3 sm:p-4"
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-sunken text-text transition-colors group-hover:bg-accent-subtle group-hover:text-accent sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-text sm:text-sm">
                      {route.title}
                    </h3>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-text-muted sm:line-clamp-none sm:text-xs">
                      {route.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 border-t border-border/70 pt-2 text-[10px] text-text-muted sm:mt-4 sm:pt-2.5 sm:text-[11px]">
                  <span className="inline-flex items-center gap-1 truncate">
                    <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {quickRoutesSection.authRequiredBadge}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 font-medium transition-colors group-hover:text-accent sm:inline-flex">
                    {quickRoutesSection.openAction}
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
