'use client';

import * as React from 'react';

export interface BreadcrumbTrailItem {
  label: string;
  href?: string;
}

export interface PageHeaderOverride {
  title?: string;
  description?: string;
  badge?: React.ReactNode;
  trail?: BreadcrumbTrailItem[];
}

interface PageHeaderContextValue {
  override: PageHeaderOverride | null;
  setOverride: React.Dispatch<React.SetStateAction<PageHeaderOverride | null>>;
}

const PageHeaderContext = React.createContext<PageHeaderContextValue | null>(
  null,
);

export function PageHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [override, setOverride] = React.useState<PageHeaderOverride | null>(
    null,
  );
  const value = React.useMemo(() => ({ override, setOverride }), [override]);
  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderOverride(): PageHeaderOverride | null {
  return React.useContext(PageHeaderContext)?.override ?? null;
}

/** Declaratively sets the navbar breadcrumb trail and compact sub-header title/description for nested routes. */
export function PageHeaderMeta({
  title,
  description,
  badge,
  trail,
}: PageHeaderOverride) {
  const ctx = React.useContext(PageHeaderContext);
  const setOverride = ctx?.setOverride;
  const trailKey = trail
    ? trail.map((t) => `${t.label}:${t.href ?? ''}`).join('|')
    : '';

  React.useEffect(() => {
    if (!setOverride) return;
    setOverride({ title, description, badge, trail });
  }, [setOverride, title, description, badge, trailKey, trail]);

  React.useEffect(() => {
    if (!setOverride) return;
    return () => setOverride(null);
  }, [setOverride]);

  return null;
}
