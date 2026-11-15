'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Globe, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  DensityToggle,
  type DensityMode,
} from '@/components/core/density-toggle';
import { Label } from '@/components/core/label';
import { Separator } from '@/components/core/separator';
import { toast } from '@/components/core/toast';
import {
  useCurrentLocale,
  useSwitchLocale,
} from '@/components/providers/client-locale-provider';
import { useSettingsQuery } from '@/hooks/use-inventory-hooks';
import { useMounted } from '@/hooks/use-mounted';
import { routing, type Locale } from '@/i18n/routing';
import { switchThemeWithTransition } from '@/lib/utils/theme-transition';
import { inventoryService } from '@/services/inventory-service';
import type { AuthSettingsCopy } from '../types';

interface ThemeSelectorCardProps {
  initialCompactMode: boolean;
  copy: AuthSettingsCopy['appearance'];
}

export function ThemeSelectorCard({
  initialCompactMode,
  copy,
}: ThemeSelectorCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const locale = useCurrentLocale();
  const switchLocale = useSwitchLocale();
  const { data: settingsData } = useSettingsQuery();
  const [switchingLocale, setSwitchingLocale] = useState<Locale | null>(null);
  const [savingDensity, setSavingDensity] = useState(false);

  const activeTheme = mounted ? (theme ?? 'system') : 'system';
  const compactMode = settingsData?.compactMode ?? initialCompactMode;
  const densityValue: DensityMode = compactMode ? 'compact' : 'detailed';

  const themeOptions = [
    { id: 'light', label: copy.themes.light, Icon: Sun },
    { id: 'dark', label: copy.themes.dark, Icon: Moon },
    { id: 'system', label: copy.themes.system, Icon: Monitor },
  ] as const;

  const handleLocaleSwitch = async (nextLocale: Locale) => {
    if (nextLocale === locale || switchingLocale) return;
    setSwitchingLocale(nextLocale);
    try {
      await switchLocale(nextLocale);
      router.refresh();
    } finally {
      setSwitchingLocale(null);
    }
  };

  const handleDensityChange = async (mode: DensityMode) => {
    const nextCompact = mode === 'compact';
    if (nextCompact === compactMode || savingDensity) return;
    setSavingDensity(true);
    try {
      const updated = await inventoryService.updateSettings({
        compactMode: nextCompact,
      });
      queryClient.setQueryData(['inventory', 'settings'], updated);
      toast.success(copy.densitySaved);
      router.refresh();
    } catch {
      toast.error(copy.densityError);
    } finally {
      setSavingDensity(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-text-muted font-mono text-2xs uppercase tracking-wider">
            {copy.themeLabel}
          </Label>
          <div
            role="radiogroup"
            aria-label={copy.themeLabel}
            className="grid grid-cols-3 gap-1.5 sm:gap-2"
          >
            {themeOptions.map(({ id, label, Icon }) => {
              const isSelected = activeTheme === id;
              return (
                <Button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onClick={(event) => {
                    if (isSelected) return;
                    void switchThemeWithTransition(id, setTheme, event);
                  }}
                  className="min-h-[42px] justify-center gap-1.5 px-2 sm:min-h-0 sm:gap-2"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-mono text-2xs uppercase tracking-wider text-ash">
              {copy.languageLabel}
            </Label>
            <div
              role="group"
              aria-label={copy.languageLabel}
              className="grid grid-cols-2 gap-2"
            >
              {routing.locales.map((itemLocale) => {
                const selected = locale === itemLocale;
                return (
                  <Button
                    key={itemLocale}
                    type="button"
                    size="sm"
                    variant={selected ? 'primary' : 'secondary'}
                    disabled={switchingLocale !== null}
                    onClick={() => void handleLocaleSwitch(itemLocale)}
                    className="justify-center gap-1.5"
                  >
                    <Globe
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {itemLocale === 'tr' ? 'Türkçe (TR)' : 'English (EN)'}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-2xs uppercase tracking-wider text-ash">
              {copy.densityLabel}
            </Label>
            <div className="flex flex-col items-start gap-1.5">
              <DensityToggle
                value={densityValue}
                onValueChange={(mode) => void handleDensityChange(mode)}
                label={copy.densityLabel}
              />
              <p className="text-text-muted text-caption">{copy.densityHint}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
