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
        href="/"
        className={`flex min-w-0 items-center ${
          collapsed ? 'justify-center' : 'flex-1 gap-2.5'
        }`}
      >
        <span className="bg-surface-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border">
          <UmayMark className="h-5 w-5" />
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="font-heading text-title text-text flex items-center gap-2 font-bold tracking-tight">
              <span className="truncate">{brand.title}</span>
              {planLabel && (
                <span className="bg-surface-sunken text-text-muted shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-caption">
                  {planLabel}
                </span>
              )}
            </span>
            <span
              className="text-text-muted block truncate text-caption"
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
        className="text-text-muted hover:text-text ml-auto shrink-0 md:hidden"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
