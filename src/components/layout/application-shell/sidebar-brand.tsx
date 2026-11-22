'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { UmayMark } from '@/components/shared/umay-brand';
import { cn } from '@/lib/utils';
import { SHELL_TOPBAR_HEIGHT_CLASS } from './types';

interface SidebarBrandProps {
  brand: { title: string; subtitle: string };
  collapsed?: boolean;
  planLabel?: string;
  onCloseMobile: () => void;
}

export function SidebarBrand({
  brand,
  collapsed = false,
  planLabel,
  onCloseMobile,
}: SidebarBrandProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center border-b border-border',
        SHELL_TOPBAR_HEIGHT_CLASS,
        collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4',
      )}
    >
      <Link
        href="/home"
        className={`flex min-w-0 items-center ${
          collapsed ? 'justify-center' : 'flex-1 gap-2.5'
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken">
          <UmayMark className="h-5 w-5" />
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-heading text-title font-bold tracking-tight text-text">
              <span className="truncate">{brand.title}</span>
              {planLabel && (
                <span className="shrink-0 rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 text-caption text-text-muted">
                  {planLabel}
                </span>
              )}
            </span>
            <span
              className="block truncate text-caption text-text-muted"
              title={brand.subtitle}
            >
              {brand.subtitle}
            </span>
          </span>
        )}
      </Link>
      <Button
        onClick={onCloseMobile}
        variant="ghost"
        size="icon-sm"
        aria-label="Menüyü kapat"
        className="ml-auto shrink-0 text-text-muted hover:text-text md:hidden"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
