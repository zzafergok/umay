import { describe, expect, it } from 'vitest';
import { Home, ShoppingCart, UserRound, Wrench } from 'lucide-react';
import {
  matchNestedRoutePattern,
  resolveNavigationHeader,
} from '@/components/layout/application-shell/nav-utils';
import type { ApplicationShellNavItem } from '@/components/layout/application-shell/types';

const navItems: ApplicationShellNavItem[] = [
  {
    href: '/home',
    label: 'Panel',
    subtitle: 'Özet ve öncelikler',
    icon: Home,
    exact: true,
  },
  {
    href: '/parts',
    label: 'Parçalar',
    subtitle: 'Ömürlü yedek parçalar',
    icon: Wrench,
    nestedRoutes: [
      {
        pattern: '/parts/[id]',
        label: 'Parça Detayı',
        subtitle: 'Kullanım, sağlık durumu ve değişim geçmişi',
      },
    ],
  },
  {
    href: '/shopping',
    label: 'Alışveriş',
    subtitle: 'Eksik ve öneriler',
    icon: ShoppingCart,
    nestedRoutes: [
      {
        pattern: '/shopping/[id]',
        label: 'Liste Detayı',
        subtitle: 'Alışveriş kalemleri, fiş tarama ve stok aktarımı',
      },
    ],
  },
];

const accountNavItems: ApplicationShellNavItem[] = [
  {
    href: '/profile',
    label: 'Profil ve Hesap',
    subtitle: 'Kişisel bilgiler, tercihler ve oturum güvenliği',
    icon: UserRound,
  },
];

describe('matchNestedRoutePattern', () => {
  it('matches dynamic single-segment route patterns', () => {
    expect(matchNestedRoutePattern('/parts/part-123', '/parts/[id]')).toBe(
      true,
    );
    expect(matchNestedRoutePattern('/parts', '/parts/[id]')).toBe(false);
    expect(matchNestedRoutePattern('/parts/a/b', '/parts/[id]')).toBe(false);
  });

  it('matches catch-all route patterns', () => {
    expect(
      matchNestedRoutePattern('/parts/cat/sub', '/parts/[...slug]'),
    ).toBe(true);
  });
});

describe('resolveNavigationHeader', () => {
  it('resolves top-level nav item title and subtitle from navigation flow', () => {
    const resolved = resolveNavigationHeader({
      pathname: '/home',
      navItems,
      accountNavItems,
    });

    expect(resolved.trail).toEqual([{ label: 'Panel' }]);
    expect(resolved.subtitle).toBe('Özet ve öncelikler');
  });

  it('resolves account nav item title and subtitle from navigation flow', () => {
    const resolved = resolveNavigationHeader({
      pathname: '/profile',
      navItems,
      accountNavItems,
    });

    expect(resolved.trail).toEqual([{ label: 'Profil ve Hesap' }]);
    expect(resolved.subtitle).toBe(
      'Kişisel bilgiler, tercihler ve oturum güvenliği',
    );
  });

  it('resolves nested route trail and subtitle from navigation flow without screen overrides', () => {
    const resolved = resolveNavigationHeader({
      pathname: '/parts/abc-123',
      navItems,
      accountNavItems,
    });

    expect(resolved.trail).toEqual([
      { label: 'Parçalar', href: '/parts' },
      { label: 'Parça Detayı' },
    ]);
    expect(resolved.subtitle).toBe(
      'Kullanım, sağlık durumu ve değişim geçmişi',
    );
  });

  it('enriches nested route leaf title and subtitle when dynamic override is present', () => {
    const resolved = resolveNavigationHeader({
      pathname: '/shopping/list-1',
      navItems,
      accountNavItems,
      override: {
        title: 'Haftalık Market',
        badge: 'Migros',
      },
    });

    expect(resolved.trail).toEqual([
      { label: 'Alışveriş', href: '/shopping' },
      { label: 'Haftalık Market' },
    ]);
    expect(resolved.subtitle).toBe(
      'Alışveriş kalemleri, fiş tarama ve stok aktarımı',
    );
    expect(resolved.badge).toBe('Migros');
  });
});
