import type { ReactNode } from 'react';
import type {
  BreadcrumbTrailItem,
  PageHeaderOverride,
} from './page-header-context';
import type {
  ApplicationShellNavItem,
  ApplicationShellNestedRoute,
} from './types';

export function isNavItemActive(
  pathname: string,
  item: ApplicationShellNavItem,
): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function matchNestedRoutePattern(
  pathname: string,
  pattern: string,
): boolean {
  const pathParts = normalizePath(pathname).split('/').filter(Boolean);
  const patternParts = normalizePath(pattern).split('/').filter(Boolean);

  if (patternParts.length === 0) return false;

  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    if (patternPart.startsWith('[...') && patternPart.endsWith(']')) {
      return pathParts.length >= i + 1;
    }
    const pathPart = pathParts[i];
    if (!pathPart) return false;
    const isDynamic = patternPart.startsWith('[') && patternPart.endsWith(']');
    if (!isDynamic && patternPart !== pathPart) {
      return false;
    }
  }

  return pathParts.length === patternParts.length;
}

export function findMatchingNestedRoute(
  pathname: string,
  item?: ApplicationShellNavItem,
): ApplicationShellNestedRoute | undefined {
  if (!item?.nestedRoutes?.length) return undefined;
  return item.nestedRoutes.find((route) =>
    matchNestedRoutePattern(pathname, route.pattern),
  );
}

export interface ResolveNavigationHeaderParams {
  pathname: string;
  navItems: ApplicationShellNavItem[];
  accountNavItems?: ApplicationShellNavItem[];
  override?: PageHeaderOverride | null;
  fallbackTitle?: ReactNode;
  fallbackSubtitle?: ReactNode;
}

export interface ResolvedNavigationHeader {
  activeItem?: ApplicationShellNavItem;
  trail: BreadcrumbTrailItem[];
  subtitle?: ReactNode;
  badge?: ReactNode;
}

export function resolveNavigationHeader({
  pathname,
  navItems,
  accountNavItems = [],
  override,
  fallbackTitle,
  fallbackSubtitle,
}: ResolveNavigationHeaderParams): ResolvedNavigationHeader {
  const activeItem =
    [...navItems, ...accountNavItems].find((item) =>
      isNavItemActive(pathname, item),
    ) ?? navItems[0];

  if (!activeItem) {
    return {
      activeItem: undefined,
      trail: override?.trail ?? [],
      subtitle: override?.description ?? fallbackSubtitle,
      badge: override?.badge,
    };
  }

  const normalizedPath = normalizePath(pathname);
  const normalizedHref = normalizePath(activeItem.href);
  const isNested =
    !activeItem.exact &&
    normalizedPath !== normalizedHref &&
    normalizedPath.startsWith(`${normalizedHref}/`);

  const matchedNested = isNested
    ? findMatchingNestedRoute(normalizedPath, activeItem)
    : undefined;

  let trail: BreadcrumbTrailItem[];
  if (override?.trail && override.trail.length > 0) {
    trail = override.trail;
  } else if (isNested) {
    const leafLabel = override?.title ?? matchedNested?.label ?? 'Detay';
    trail = [
      { label: activeItem.label, href: activeItem.href },
      { label: leafLabel },
    ];
  } else {
    const rootLabel =
      override?.title ??
      (typeof fallbackTitle === 'string' ? fallbackTitle : undefined) ??
      activeItem.label;
    trail = [{ label: rootLabel }];
  }

  const subtitle =
    override?.description ??
    matchedNested?.subtitle ??
    fallbackSubtitle ??
    activeItem.subtitle;

  return {
    activeItem,
    trail,
    subtitle,
    badge: override?.badge,
  };
}
