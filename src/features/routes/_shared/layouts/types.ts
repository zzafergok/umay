import type { LucideIcon } from 'lucide-react';

export type ShellNavItem = {
  href: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  highlight?: boolean;
};

export type ShellCopy = {
  brand: {
    title: string;
    subtitle: string;
  };
  publicNav: Array<
    Omit<ShellNavItem, 'icon'> & { icon: 'boxes' | 'login' | string }
  >;
  authNav: Array<
    Omit<ShellNavItem, 'icon'> & {
      icon: 'home' | 'wrench' | 'settings' | string;
    }
  >;
  accountNav?: Array<
    Omit<ShellNavItem, 'icon'> & {
      icon: string;
    }
  >;
  authHeader: {
    title: string;
    subtitle: string;
  };
  loading?: string;
  footer?: string;
  preferenceControls?: {
    themeLight: string;
    themeDark: string;
    themeError: string;
    languageError: string;
  };
  density?: {
    label: string;
    compact: string;
    detailed: string;
  };
};
