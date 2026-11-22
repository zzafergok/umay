'use client';

import {
  Activity,
  Boxes,
  Home,
  LayoutDashboard,
  MapPin,
  ScanLine,
  Settings,
  Shield,
  ShoppingCart,
  Tags,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import {
  ApplicationShell,
  type ApplicationShellNavItem,
} from '@/components/layout/application-shell';
import { CommandPaletteTrigger } from '@/components/layout/command-palette';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  SidebarUserFooter,
  UserAccountMenu,
} from '@/components/shared/account-actions';
import { getShellCopy } from '@/features/routes/_shared/layouts/i18n';
import { useI18n } from '@/hooks/use-i18n';

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  boxes: Boxes,
  home: Home,
  dashboard: LayoutDashboard,
  mapPin: MapPin,
  scanLine: ScanLine,
  settings: Settings,
  shield: Shield,
  shoppingCart: ShoppingCart,
  tags: Tags,
  user: UserRound,
  users: Users,
  wrench: Wrench,
};

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { copy } = useI18n(getShellCopy);
  const navItems: ApplicationShellNavItem[] = (copy.authNav ?? []).map(
    (item) => ({
      href: item.href,
      label: item.label,
      subtitle: item.subtitle ?? copy.authHeader?.subtitle,
      icon: iconMap[item.icon] ?? Home,
      exact: item.href === '/home',
    }),
  );

  const accountNavItems: ApplicationShellNavItem[] = (
    copy.accountNav ?? []
  ).map((item) => ({
    href: item.href,
    label: item.label,
    subtitle: item.subtitle ?? copy.authHeader?.subtitle,
    icon: iconMap[item.icon] ?? UserRound,
  }));

  return (
    <ApplicationShell
      brand={copy.brand}
      navItems={navItems}
      accountNavItems={accountNavItems}
      footer={({ collapsed }) => <SidebarUserFooter collapsed={collapsed} />}
      headerActions={
        <>
          <CommandPaletteTrigger />
          <div className="hidden items-center gap-1.5 sm:flex">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <UserAccountMenu />
        </>
      }
    >
      {children}
    </ApplicationShell>
  );
}
