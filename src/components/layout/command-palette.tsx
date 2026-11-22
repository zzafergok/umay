'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Boxes,
  Home,
  LogOut,
  MapPin,
  Search,
  Settings,
  ShoppingCart,
  Tags,
  UserRound,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/core/command';
import { Kbd } from '@/components/core/kbd';
import { toast } from '@/components/core/toast';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { getAccountActionsCopy } from '@/components/shared/account-actions/i18n';
import { useLogoutMutation } from '@/hooks/use-auth-hooks';
import { useItemsQuery, usePartsQuery } from '@/hooks/use-inventory-hooks';

const OPEN_COMMAND_PALETTE_EVENT = 'umay:open-command-palette';

export function CommandPaletteTrigger() {
  const locale = useCurrentLocale();
  const label = locale === 'en' ? 'Quick search...' : 'Hızlı ara...';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={label}
      onClick={() =>
        window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT))
      }
      className="h-8 min-h-0 gap-2 border-border bg-surface-sunken/70 px-2.5 text-caption font-normal text-text-muted hover:bg-surface-sunken hover:text-text sm:w-44 sm:justify-between md:w-52"
    >
      <span className="flex items-center gap-1.5 truncate">
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden truncate sm:inline">{label}</span>
      </span>
      <Kbd className="hidden shrink-0 sm:inline-flex">⌘K</Kbd>
    </Button>
  );
}

const ICON_BADGE_CLASS =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-surface-sunken text-text-muted transition-colors group-data-[selected=true]/cmd-item:border-accent/30 group-data-[selected=true]/cmd-item:bg-accent/10 group-data-[selected=true]/cmd-item:text-accent';

export function CommandPalette() {
  const router = useRouter();
  const locale = useCurrentLocale();
  const accountCopy = getAccountActionsCopy(locale);
  const [open, setOpen] = React.useState(false);
  const { data: items = [] } = useItemsQuery();
  const { data: partsData } = usePartsQuery();
  const logoutMutation = useLogoutMutation();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logoutMutation.mutateAsync();
      toast.success(accountCopy.logoutSuccess);
    } catch {
      toast.warning(accountCopy.logoutError);
    } finally {
      router.replace('/');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/home', label: 'Panel', Icon: Home },
    { href: '/items', label: 'Ürünler', Icon: Boxes },
    { href: '/parts', label: 'Ömürlü Parçalar', Icon: Wrench },
    { href: '/shopping', label: 'Alışveriş Listesi', Icon: ShoppingCart },
    { href: '/locations', label: 'Konumlar', Icon: MapPin },
    { href: '/categories', label: 'Kategoriler', Icon: Tags },
    { href: '/activity', label: 'Faaliyet Günlüğü', Icon: Activity },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Ürün, parça veya sayfa ara..." />
      <CommandList>
        <CommandEmpty>Eşleşen sonuç bulunamadı.</CommandEmpty>

        <CommandGroup heading="Hızlı Gezinme">
          {navItems.map(({ href, label, Icon }) => (
            <CommandItem key={href} onSelect={() => go(href)}>
              <span className={ICON_BADGE_CLASS}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="font-medium">{label}</span>
              <CommandShortcut className="flex items-center gap-1">
                <span>{href}</span>
                <ArrowRight
                  className="h-3 w-3 opacity-0 transition-opacity group-data-[selected=true]/cmd-item:opacity-100"
                  aria-hidden="true"
                />
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={accountCopy.menuAccountLabel}>
          <CommandItem onSelect={() => go('/profile')}>
            <span className={ICON_BADGE_CLASS}>
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="font-medium">{accountCopy.menuProfile}</span>
            <CommandShortcut>/profile</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <span className={ICON_BADGE_CLASS}>
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="font-medium">{accountCopy.menuSettings}</span>
            <CommandShortcut>/settings</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => void handleLogout()}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-danger/20 bg-danger-subtle/60 text-danger">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="font-medium text-danger">
              {accountCopy.logoutLabel}
            </span>
          </CommandItem>
        </CommandGroup>

        {items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ürünler">
              {items.slice(0, 15).map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => go(`/items?item=${item.id}`)}
                >
                  <span className={ICON_BADGE_CLASS}>
                    <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="truncate font-medium">{item.name}</span>
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="ml-auto font-mono tabular-nums"
                  >
                    {item.quantity} {item.unit}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {(partsData?.parts.length ?? 0) > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ömürlü Parçalar">
              {partsData?.parts.slice(0, 10).map((part) => (
                <CommandItem
                  key={part.id}
                  onSelect={() => go(`/parts/${part.id}`)}
                >
                  <span className={ICON_BADGE_CLASS}>
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="truncate font-medium">{part.name}</span>
                  <CommandShortcut>/parts</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="flex items-center justify-between border-t border-border/80 bg-surface-sunken/50 px-4 py-2 text-[11px] text-text-muted">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>Gezin</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd>
            <span>Aç</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1">
          <Kbd>Ctrl/⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </div>
    </CommandDialog>
  );
}
