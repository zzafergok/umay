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
import { ApplicationShellFooter } from './application-shell-footer';
import { SidebarBrand } from './sidebar-brand';
import { SidebarNav } from './sidebar-nav';
import { ApplicationShellHeader } from './application-shell-header';
import { resolveNavigationHeader } from './nav-utils';
import {
  PageHeaderProvider,
  usePageHeaderOverride,
} from './page-header-context';
import type { ApplicationShellProps } from './types';

export function ApplicationShell({ ...props }: ApplicationShellProps) {
  return (
    <SidebarProvider className="bg-bg font-sans text-text [&_[data-sidebar=sidebar]]:bg-surface [&_[data-sidebar=sidebar]]:text-text">
      <PageHeaderProvider>
        <ApplicationShellContent {...props} />
      </PageHeaderProvider>
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
  const override = usePageHeaderOverride();
  const collapsed = state === 'collapsed';

  const resolvedHeader = React.useMemo(
    () =>
      resolveNavigationHeader({
        pathname,
        navItems,
        accountNavItems,
        override,
        fallbackTitle: pageHeaderTitle,
        fallbackSubtitle: pageHeaderDescription,
      }),
    [
      pathname,
      navItems,
      accountNavItems,
      override,
      pageHeaderTitle,
      pageHeaderDescription,
    ],
  );

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

      <SidebarInset className="min-h-screen bg-bg text-text antialiased selection:bg-accent/20 selection:text-text">
        <ApplicationShellHeader
          trail={resolvedHeader.trail}
          subtitle={hidePageHeader ? undefined : resolvedHeader.subtitle}
          badge={hidePageHeader ? undefined : resolvedHeader.badge}
          collapsed={collapsed}
          headerActions={headerActions}
          pageHeaderActions={hidePageHeader ? undefined : pageHeaderActions}
          onOpenMobile={toggleSidebar}
          onToggleCollapsed={toggleSidebar}
        />

        <div className="w-full min-w-0 flex-1 p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-8 lg:px-8 lg:py-5">
          {children}
        </div>

        <ApplicationShellFooter placement="content">
          {contentFooter ?? 'Umay © 2026'}
        </ApplicationShellFooter>
      </SidebarInset>
    </>
  );
}
