'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Home,
  LogOut,
  QrCode,
  Settings,
  ShoppingCart,
  UserRound,
  Wrench,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/core/command';
import { toast } from '@/components/core/toast';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { getAccountActionsCopy } from '@/components/shared/account-actions/i18n';
import { useLogoutMutation } from '@/hooks/use-auth-hooks';
import { useItemsQuery, usePartsQuery } from '@/hooks/use-inventory-hooks';

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
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Ürün, parça veya sayfa ara... (Ctrl/⌘+K)" />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup heading="Hızlı Gezinme">
          <CommandItem onSelect={() => go('/home')}>
            <Home className="mr-2 h-4 w-4" />
            <span>Panel</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/items')}>
            <Boxes className="mr-2 h-4 w-4" />
            <span>Ürünler</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/parts')}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Ömürlü Parçalar</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/shopping')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Alışveriş Listesi</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/scan')}>
            <QrCode className="mr-2 h-4 w-4" />
            <span>Barkod / QR Tara</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={accountCopy.menuAccountLabel}>
          <CommandItem onSelect={() => go('/profile')}>
            <UserRound className="mr-2 h-4 w-4" />
            <span>{accountCopy.menuProfile}</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{accountCopy.menuSettings}</span>
          </CommandItem>
          <CommandItem onSelect={() => void handleLogout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{accountCopy.logoutLabel}</span>
          </CommandItem>
        </CommandGroup>
        {items.length > 0 && (
          <CommandGroup heading="Ürünler">
            {items.slice(0, 15).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => go(`/items/${item.id}`)}
              >
                <Boxes className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {(partsData?.parts.length ?? 0) > 0 && (
          <CommandGroup heading="Ömürlü Parçalar">
            {partsData?.parts.slice(0, 10).map((part) => (
              <CommandItem
                key={part.id}
                onSelect={() => go(`/parts/${part.id}`)}
              >
                <Wrench className="mr-2 h-4 w-4" />
                <span>{part.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
