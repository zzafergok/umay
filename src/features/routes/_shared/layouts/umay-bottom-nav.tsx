'use client';

import { Boxes, Home, MoreHorizontal, ShoppingCart, Wrench } from 'lucide-react';
import { BottomNav, type BottomNavItem } from '@/components/core/bottom-nav';
import { useI18n } from '@/hooks/use-i18n';

const TR_ITEMS: BottomNavItem[] = [
  { href: '/home', label: 'Panel', icon: Home },
  { href: '/items', label: 'Ürünler', icon: Boxes, matchPrefix: true },
  { href: '/parts', label: 'Parçalar', icon: Wrench, matchPrefix: true },
  { href: '/shopping', label: 'Liste', icon: ShoppingCart },
  { href: '/settings', label: 'Daha Fazla', icon: MoreHorizontal },
];

const EN_ITEMS: BottomNavItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/items', label: 'Items', icon: Boxes, matchPrefix: true },
  { href: '/parts', label: 'Parts', icon: Wrench, matchPrefix: true },
  { href: '/shopping', label: 'List', icon: ShoppingCart },
  { href: '/settings', label: 'More', icon: MoreHorizontal },
];

export function UmayBottomNav() {
  const { locale } = useI18n();
  const items = locale === 'en' ? EN_ITEMS : TR_ITEMS;

  return (
    <BottomNav
      items={items}
      ariaLabel={locale === 'en' ? 'Primary navigation' : 'Ana gezinme'}
    />
  );
}
