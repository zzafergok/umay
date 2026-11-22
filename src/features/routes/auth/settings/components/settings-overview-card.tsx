'use client';

import {
  CalendarClock,
  Globe,
  Home,
  Layers,
  Palette,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useSettingsQuery } from '@/hooks/use-inventory-hooks';
import { useMounted } from '@/hooks/use-mounted';
import type { AuthSettingsCopy, SettingsSnapshot } from '../types';

interface SettingsOverviewCardProps {
  initialSettings: SettingsSnapshot;
  draftRules?: Pick<
    SettingsSnapshot,
    'currency' | 'dateFormat' | 'defaultUnit'
  > | null;
  openProfileLabel: string;
  unitOptions: AuthSettingsCopy['inventoryRules']['unitOptions'];
  dateFormatOptions: AuthSettingsCopy['inventoryRules']['dateFormatOptions'];
  copy: AuthSettingsCopy['overview'];
}

const CURRENCY_SYMBOLS: Record<SettingsSnapshot['currency'], string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

export function SettingsOverviewCard({
  initialSettings,
  draftRules,
  openProfileLabel,
  unitOptions,
  dateFormatOptions,
  copy,
}: SettingsOverviewCardProps) {
  const { theme } = useTheme();
  const mounted = useMounted();
  const locale = useCurrentLocale();
  const { data: settingsData } = useSettingsQuery();

  const current = { ...initialSettings, ...settingsData, ...draftRules };
  const activeThemeKey = (
    mounted && (theme === 'light' || theme === 'dark' || theme === 'system')
      ? theme
      : 'system'
  ) as 'light' | 'dark' | 'system';

  const densityLabel = current.compactMode
    ? copy.compactLabel
    : copy.detailedLabel;

  const currencySymbol = CURRENCY_SYMBOLS[current.currency] ?? '';
  const dateLabel =
    dateFormatOptions[current.dateFormat]?.split(' ')[0] ?? current.dateFormat;
  const unitLabel =
    unitOptions[current.defaultUnit as keyof typeof unitOptions] ??
    current.defaultUnit;

  const summaryItems = [
    {
      label: copy.themeLabel,
      value: copy.themes[activeThemeKey],
      Icon: Palette,
    },
    {
      label: copy.languageLabel,
      value: locale === 'en' ? 'English (EN)' : 'Türkçe (TR)',
      Icon: Globe,
    },
    {
      label: copy.formatLabel,
      value: `${currencySymbol} ${current.currency} · ${dateLabel}`,
      Icon: CalendarClock,
    },
    {
      label: copy.unitAndDensityLabel,
      value: `${unitLabel} · ${densityLabel}`,
      Icon: Layers,
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-accent-subtle">
              <SlidersHorizontal
                className="h-5 w-5 text-accent"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0 space-y-1">
              <h2 className="truncate font-heading text-title font-bold text-text">
                {copy.activeConfigTitle}
              </h2>
              <p className="text-body-sm text-text-muted">
                {copy.activeConfigSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/profile">
                <UserRound className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{openProfileLabel}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/home">
                <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{copy.backToHomeLabel}</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-md border border-border bg-surface-sunken px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                <Icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-caption text-text-muted">{label}</p>
                <p className="truncate text-body-sm font-semibold tabular-nums text-text">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
