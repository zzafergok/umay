import { Link } from '@/components/core/link';
import {
  Activity,
  Boxes,
  Home,
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
import { UmayMark } from '@/components/shared/umay-brand';
import { cn } from '@/lib/utils';
import { CommandPalette } from '@/components/layout/command-palette';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { getShellCopy } from './i18n';
import { UmayBottomNav } from './umay-bottom-nav';
import type { ShellCopy, ShellNavItem } from './types';

const navIcons = {
  activity: Activity,
  boxes: Boxes,
  home: Home,
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
      <span className="bg-surface-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border">
        <UmayMark className="h-5 w-5" />
      </span>
      {!compact && (
        <span>
          <span className="font-heading text-title text-text block font-bold tracking-tight">
            {copy.title}
          </span>
          <span className="text-text-muted block text-caption">
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
}: {
  items: ShellNavItem[];
  direction?: 'row' | 'column';
}) {
  if (items.length === 0) return null;
  return (
    <nav
      className={cn(
        'flex gap-2',
        direction === 'column' ? 'flex-col' : 'items-center',
      )}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            'text-body-sm text-text-muted hover:text-text font-medium',
            direction === 'column' && 'justify-start',
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
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
    <div className="bg-bg text-text min-h-screen">
      <header className="bg-surface sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandMark copy={copy.brand} />
          <div className="flex items-center gap-3">
            <ShellNav items={mapNavItems(copy.publicNav)} />
            <ShellControls />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export async function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellLayout>
      {children}
      <CommandPalette />
      <UmayBottomNav />
    </AppShellLayout>
  );
}
