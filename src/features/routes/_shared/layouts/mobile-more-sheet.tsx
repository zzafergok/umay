'use client';

import {
  Activity,
  MapPin,
  ScanLine,
  Settings,
  Tags,
  UserRound,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Link } from '@/components/core/link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: 'tr' | 'en';
}

const SECONDARY_LINKS = [
  { href: '/scan', tr: 'Barkod & QR Tarama', en: 'Scan Barcode / QR', icon: ScanLine },
  { href: '/locations', tr: 'Konumlar', en: 'Locations', icon: MapPin },
  { href: '/categories', tr: 'Kategoriler', en: 'Categories', icon: Tags },
  { href: '/activity', tr: 'Hareketler', en: 'Activity', icon: Activity },
  { href: '/profile', tr: 'Profil & Hesap', en: 'Profile & Account', icon: UserRound },
  { href: '/settings', tr: 'Ayarlar', en: 'Settings', icon: Settings },
] as const;

export function MobileMoreSheet({
  open,
  onOpenChange,
  locale,
}: MobileMoreSheetProps) {
  const pathname = usePathname();
  const isEn = locale === 'en';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePresentation="sheet"
        className="bg-surface/92 dark:bg-surface-raised/92 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 w-auto max-w-none translate-x-0 rounded-[24px] p-4 backdrop-blur-2xl backdrop-saturate-150 sm:left-[50%] sm:right-auto sm:w-full sm:max-w-lg sm:translate-x-[-50%] sm:rounded-2xl sm:p-6"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-base">
            {isEn ? 'All Workspaces' : 'Diğer Ekranlar & Ayarlar'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEn
              ? 'Jump directly to scanning, locations, categories, or account settings.'
              : 'Tarama, konumlar, kategoriler, hareketler ve hesap ayarlarına geçin.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {SECONDARY_LINKS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'border-border flex min-h-[44px] items-center gap-2.5 rounded-xl border p-3 text-left text-xs font-medium transition-colors',
                  active
                    ? 'border-accent/40 bg-accent-subtle text-accent'
                    : 'bg-surface hover:bg-surface-sunken text-text',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{isEn ? item.en : item.tr}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:hidden">
          <span className="text-text-muted text-xs font-medium">
            {isEn ? 'Theme & Language' : 'Tema & Dil'}
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
