'use client';

import {
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Plus,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { BottomNav, type BottomNavItem } from '@/components/core/bottom-nav';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { useI18n } from '@/hooks/use-i18n';

const TR_ITEMS: BottomNavItem[] = [
  { href: '/home', label: 'Panel', icon: LayoutDashboard },
  { href: '/items', label: 'Ürünler', icon: Package, matchPrefix: true },
  { href: '/parts', label: 'Parçalar', icon: Wrench, matchPrefix: true },
  { href: '/shopping', label: 'Liste', icon: ShoppingCart },
  { href: '/settings', label: 'Daha fazla', icon: MoreHorizontal },
];

const EN_ITEMS: BottomNavItem[] = [
  { href: '/home', label: 'Home', icon: LayoutDashboard },
  { href: '/items', label: 'Items', icon: Package, matchPrefix: true },
  { href: '/parts', label: 'Parts', icon: Wrench, matchPrefix: true },
  { href: '/shopping', label: 'List', icon: ShoppingCart },
  { href: '/settings', label: 'More', icon: MoreHorizontal },
];

export function UmayBottomNav() {
  const { locale } = useI18n();
  const items = locale === 'en' ? EN_ITEMS : TR_ITEMS;

  return (
    <>
      <Button
        asChild
        variant="primary"
        className="shadow-float dark:border-border-strong fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full px-4 dark:border md:hidden"
      >
        <Link href="/items?new=1">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span>{locale === 'en' ? 'Add' : 'Ekle'}</span>
        </Link>
      </Button>
      <BottomNav
        items={items}
        ariaLabel={locale === 'en' ? 'Primary navigation' : 'Ana gezinme'}
      />
    </>
  );
}
