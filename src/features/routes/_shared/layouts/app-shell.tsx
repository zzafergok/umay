import { Link } from '@/components/core/link';
import {
  Activity,
  Boxes,
  HelpCircle,
  Home,
  Layers,
  LogIn,
  MapPin,
  ScanLine,
  Settings,
  Shield,
  ShoppingCart,
  Tags,
  Users,
  Wrench,
} from 'lucide-react';

import { Button } from '@/components/core/button';
import { AppShellLayout } from '@/components/layout/AppShellLayout';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AuthSessionGuard } from '@/components/shared/auth-route-guard';
import { UmayMark } from '@/components/shared/umay-brand';
import { cn } from '@/lib/utils';
import { CommandPalette } from '@/components/layout/command-palette';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { getShellCopy } from './i18n';
import { ShellNavLink } from './shell-nav-link';
import { UmayBottomNav } from './umay-bottom-nav';
import type { ShellCopy, ShellNavItem } from './types';

const navIcons = {
  activity: Activity,
  boxes: Boxes,
  helpCircle: HelpCircle,
  home: Home,
  layers: Layers,
  login: LogIn,
  mapPin: MapPin,
  scanLine: ScanLine,
  settings: Settings,
  shield: Shield,
  shoppingCart: ShoppingCart,
  tags: Tags,
  users: Users,
  wrench: Wrench,
} as const;

function mapNavItems(
  items: ReturnType<typeof getShellCopy>['publicNav'],
): ShellNavItem[];
function mapNavItems(
  items: ReturnType<typeof getShellCopy>['authNav'],
): ShellNavItem[];
function mapNavItems(
  items: Array<{
    href: string;
    label: string;
    icon: string;
  }>,
): ShellNavItem[] {
  return items.map((item) => ({
    href: item.href,
    label: item.label,
    icon: navIcons[item.icon as keyof typeof navIcons] ?? navIcons.home,
  }));
}

export function BrandMark({
  compact = false,
  copy,
}: {
  compact?: boolean;
  copy: ShellCopy['brand'];
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken">
        <UmayMark className="h-5 w-5" />
      </span>
      {!compact && (
        <span>
          <span className="block font-heading text-title font-bold tracking-tight text-text">
            {copy.title}
          </span>
          <span className="block text-caption text-text-muted">
            {copy.subtitle}
          </span>
        </span>
      )}
    </Link>
  );
}

function ShellNav({
  items,
  direction = 'row',
  className,
}: {
  items: ShellNavItem[];
  direction?: 'row' | 'column';
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      className={cn(
        'flex gap-1',
        direction === 'column' ? 'flex-col' : 'items-center',
        className,
      )}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            'text-body-sm font-medium text-text-muted hover:text-text',
            direction === 'column' && 'justify-start',
          )}
        >
          <ShellNavLink href={item.href}>
            <item.icon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {item.label}
          </ShellNavLink>
        </Button>
      ))}
    </nav>
  );
}

function ShellControls() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  );
}

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const copy = getShellCopy(locale);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-16 lg:gap-4 lg:px-8">
          <BrandMark copy={copy.brand} />
          <ShellNav
            items={mapNavItems(copy.publicNav)}
            className="hidden lg:flex"
          />
          <div className="flex items-center gap-2">
            <ShellControls />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

export async function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellLayout>
      <AuthSessionGuard />
      {children}
      <CommandPalette />
      <UmayBottomNav />
    </AppShellLayout>
  );
}
