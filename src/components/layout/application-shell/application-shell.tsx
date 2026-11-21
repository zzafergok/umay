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
import {
  PageHeaderProvider,
  usePageHeaderOverride,
} from './page-header-context';
import type { ApplicationShellProps } from './types';

export function ApplicationShell({ ...props }: ApplicationShellProps) {
  return (
    <SidebarProvider className="bg-bg text-text [&_[data-sidebar=sidebar]]:bg-surface [&_[data-sidebar=sidebar]]:text-text font-sans">
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
          pathname={pathname}
          trail={override?.trail}
          collapsed={collapsed}
          headerActions={headerActions}
          onOpenMobile={toggleSidebar}
          onToggleCollapsed={toggleSidebar}
        />

        {active && !hidePageHeader && (
          <PageHeader
            title={override?.title ?? pageHeaderTitle ?? active.label}
            description={
              override?.description ?? pageHeaderDescription ?? active.subtitle
            }
            badge={override?.badge}
            actions={pageHeaderActions}
          />
        )}

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
