'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/core/sidebar';
import { PageHeader } from '@/components/layout/page-header';
import { ApplicationShellFooter } from './application-shell-footer';
import { SidebarBrand } from './sidebar-brand';
import { SidebarNav } from './sidebar-nav';
import { ApplicationShellHeader } from './application-shell-header';
import { isNavItemActive } from './nav-utils';
import type { ApplicationShellProps } from './types';

export function ApplicationShell({ ...props }: ApplicationShellProps) {
  return (
    <SidebarProvider className="bg-bg text-text [&_[data-sidebar=sidebar]]:bg-surface [&_[data-sidebar=sidebar]]:text-text font-sans">
      <ApplicationShellContent {...props} />
    </SidebarProvider>
  );
}

function ApplicationShellContent({
  children,
  brand,
  footer,
  navItems,
  accountNavItems = [],
  headerActions,
  planLabel,
  contentFooter,
  hidePageHeader = false,
  pageHeaderTitle,
  pageHeaderDescription,
  pageHeaderActions,
}: ApplicationShellProps) {
  const pathname = usePathname();
  const { setOpenMobile, state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const active =
    [...navItems, ...accountNavItems].find((item) =>
      isNavItemActive(pathname, item),
    ) ?? navItems[0];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="gap-0 p-0">
          <SidebarBrand
            brand={brand}
            collapsed={collapsed}
            planLabel={planLabel}
            onCloseMobile={() => setOpenMobile(false)}
          />
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <SidebarNav
            navItems={navItems}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={() => setOpenMobile(false)}
          />
        </SidebarContent>
        {footer && (
          <SidebarFooter className="gap-0 p-0">
            <ApplicationShellFooter placement="sidebar" collapsed={collapsed}>
              {typeof footer === 'function'
                ? footer({ collapsed })
                : React.isValidElement(footer)
                  ? React.cloneElement(
                      footer as React.ReactElement<{ compact?: boolean }>,
                      { compact: collapsed },
                    )
                  : footer}
            </ApplicationShellFooter>
          </SidebarFooter>
        )}
      </Sidebar>

      <SidebarInset className="bg-bg text-text selection:text-text min-h-screen antialiased selection:bg-accent/20">
        <ApplicationShellHeader
          active={active}
          collapsed={collapsed}
          headerActions={headerActions}
          onOpenMobile={toggleSidebar}
          onToggleCollapsed={toggleSidebar}
        />

        <div className="mx-auto w-full min-w-0 max-w-screen-2xl flex-1 p-4 pb-28 sm:p-6 sm:pb-28 md:pb-8 lg:p-8">
          <div className="space-y-6">
            {active && !hidePageHeader && (
              <PageHeader
                title={pageHeaderTitle ?? active.label}
                description={pageHeaderDescription ?? active.subtitle}
                actions={pageHeaderActions}
              />
            )}
            {children}
          </div>
        </div>

        <ApplicationShellFooter placement="content">
          {contentFooter ?? 'Umay © 2026'}
        </ApplicationShellFooter>
      </SidebarInset>
    </>
  );
}
