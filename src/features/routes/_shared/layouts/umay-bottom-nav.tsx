'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Plus,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { BottomNav, type BottomNavItem } from '@/components/core/bottom-nav';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { useI18n } from '@/hooks/use-i18n';
import { MobileMoreSheet } from './mobile-more-sheet';

const SECONDARY_PREFIXES = [
  '/locations',
  '/categories',
  '/activity',
  '/profile',
  '/settings',
];

const ITEM_FAB_ROUTES = new Set(['/home', '/items']);

export function UmayBottomNav() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const showItemFab = ITEM_FAB_ROUTES.has(pathname);
  const isSecondaryActive = SECONDARY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isEn = locale === 'en';
  const items: BottomNavItem[] = [
    { href: '/home', label: isEn ? 'Home' : 'Panel', icon: LayoutDashboard },
    {
      href: '/items',
      label: isEn ? 'Items' : 'Ürünler',
      icon: Package,
      matchPrefix: true,
    },
    {
      href: '/parts',
      label: isEn ? 'Parts' : 'Parçalar',
      icon: Wrench,
      matchPrefix: true,
    },
    {
      href: '/shopping',
      label: isEn ? 'List' : 'Liste',
      icon: ShoppingCart,
    },
    {
      href: '#more',
      label: isEn ? 'More' : 'Daha fazla',
      icon: MoreHorizontal,
      active: moreOpen || isSecondaryActive,
      onClick: () => setMoreOpen(true),
    },
  ];

  return (
    <>
      {showItemFab && (
        <Button
          asChild
          variant="primary"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 min-h-[44px] rounded-full px-4 shadow-float backdrop-blur-md dark:border dark:border-border-strong md:hidden"
        >
          <Link href="/items?new=1">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>{isEn ? 'Add' : 'Ekle'}</span>
          </Link>
        </Button>
      )}
      <BottomNav
        items={items}
        ariaLabel={isEn ? 'Primary navigation' : 'Ana gezinme'}
      />
      <MobileMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        locale={locale}
      />
    </>
  );
}
