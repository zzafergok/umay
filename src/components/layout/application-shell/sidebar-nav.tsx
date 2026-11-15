'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/components/core/link';
import { TooltipComponent } from '@/components/core/tooltip';
import { isNavItemActive } from './nav-utils';
import type { ApplicationShellNavItem } from './types';

interface SidebarNavProps {
  navItems: ApplicationShellNavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}

export function SidebarNav({
  navItems,
  pathname,
  collapsed,
  onNavigate,
}: SidebarNavProps) {
  return (
    <nav className={`flex-1 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
      {navItems.map((item) => {
        const isActive = isNavItemActive(pathname, item);
        const Icon = item.icon;

        if (collapsed) {
          const collapsedClassName = `flex h-11 w-full items-center justify-center rounded-md border transition-colors duration-150 ${
            isActive
              ? 'border-accent/25 bg-accent-subtle text-accent'
              : item.highlight
                ? 'border-border bg-surface text-accent hover:border-border-strong'
                : 'border-transparent text-text-muted hover:bg-surface-sunken hover:text-text'
          }`;

          const content = (
            <Icon
              className={`h-5 w-5 shrink-0 ${
                isActive
                  ? 'text-accent'
                  : item.highlight
                    ? 'text-warning'
                    : 'text-text-muted'
              }`}
            />
          );

          return (
            <TooltipComponent
              key={item.href}
              content={
                <div>
                  <div className="font-medium">{item.label}</div>
                  {item.subtitle && (
                    <div className="text-text-muted text-caption">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              }
              side="right"
            >
              {isActive ? (
                <div
                  aria-current="page"
                  aria-disabled="true"
                  className={collapsedClassName}
                >
                  {content}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={collapsedClassName}
                  aria-label={item.label}
                >
                  {content}
                </Link>
              )}
            </TooltipComponent>
          );
        }

        const expandedClassName = `flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors duration-150 ${
          isActive
            ? 'border-accent/25 bg-accent-subtle text-accent'
            : item.highlight
              ? 'border-border bg-surface text-accent hover:border-border-strong'
              : 'border-transparent text-text-muted hover:bg-surface-sunken hover:text-text'
        }`;

        const content = (
          <>
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive
                    ? 'text-accent'
                    : item.highlight
                      ? 'text-warning'
                      : 'text-text-muted'
                }`}
              />
              <span className="min-w-0 flex-1 text-left">
                <span
                  className={`text-body-sm block truncate font-medium ${
                    isActive ? 'text-text' : ''
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
                {item.subtitle && (
                  <span
                    className="text-text-muted block truncate text-caption"
                    title={item.subtitle}
                  >
                    {item.subtitle}
                  </span>
                )}
              </span>
            </span>
            {isActive && (
              <ChevronRight className="h-4 w-4 shrink-0 text-accent" />
            )}
          </>
        );

        return isActive ? (
          <div
            key={item.href}
            aria-current="page"
            aria-disabled="true"
            className={expandedClassName}
          >
            {content}
          </div>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={expandedClassName}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
