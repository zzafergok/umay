'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Globe,
  Monitor,
  Moon,
  Save,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Label } from '@/components/core/label';
import { Separator } from '@/components/core/separator';
import { toast } from '@/components/core/toast';
import { Form, SelectField, SubmitButton } from '@/components/forms';
import {
  useCurrentLocale,
  useSwitchLocale,
} from '@/components/providers/client-locale-provider';
import { useSettingsQuery } from '@/hooks/use-inventory-hooks';
import { useMounted } from '@/hooks/use-mounted';
import { routing, type Locale } from '@/i18n/routing';
import { inventoryService } from '@/services/inventory-service';
import type { AuthProfileCopy, ProfileSettingsSnapshot } from '../types';

const profilePreferencesFormSchema = z.object({
  currency: z.enum(['TRY', 'USD', 'EUR']),
  dateFormat: z.enum(['dd.MM.yyyy', 'yyyy-MM-dd']),
});

type ProfilePreferencesFormValues = z.infer<
  typeof profilePreferencesFormSchema
>;

interface ProfilePreferencesCardProps {
  initialSettings: ProfileSettingsSnapshot;
  copy: AuthProfileCopy['preferences'];
}

export function ProfilePreferencesCard({
  initialSettings,
  copy,
}: ProfilePreferencesCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: settingsData } = useSettingsQuery();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const locale = useCurrentLocale();
  const switchLocale = useSwitchLocale();
  const [saving, setSaving] = useState(false);
  const [switchingLocale, setSwitchingLocale] = useState<Locale | null>(null);

  const currentSettings = settingsData ?? initialSettings;
  const activeTheme = mounted ? (theme ?? 'system') : 'system';

  const methods = useForm<ProfilePreferencesFormValues>({
    resolver: zodResolver(profilePreferencesFormSchema),
    defaultValues: {
      currency: currentSettings.currency,
      dateFormat: currentSettings.dateFormat,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset({
      currency: currentSettings.currency,
      dateFormat: currentSettings.dateFormat,
    });
  }, [currentSettings.currency, currentSettings.dateFormat, methods]);

  const handleSubmit = async (formData: ProfilePreferencesFormValues) => {
    setSaving(true);
    try {
      const updated = await inventoryService.updateSettings(formData);
      queryClient.setQueryData(['inventory', 'settings'], updated);
      methods.reset({
        currency: updated.currency,
        dateFormat: updated.dateFormat,
      });
      toast.success(copy.successMessage);
      router.refresh();
    } catch {
      toast.error(copy.errorMessage);
    } finally {
      setSaving(false);
    }
  };

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

  const themeOptions = [
    { id: 'light', label: copy.themes.light, Icon: Sun },
    { id: 'dark', label: copy.themes.dark, Icon: Moon },
    { id: 'system', label: copy.themes.system, Icon: Monitor },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="h-5 w-5 text-accent"
            aria-hidden="true"
          />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Form<ProfilePreferencesFormValues>
          schema={profilePreferencesFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              name="currency"
              label={copy.currencyLabel}
              options={[
                { value: 'TRY', label: copy.currencyOptions.TRY },
                { value: 'USD', label: copy.currencyOptions.USD },
                { value: 'EUR', label: copy.currencyOptions.EUR },
              ]}
            />
            <SelectField
              name="dateFormat"
              label={copy.dateFormatLabel}
              options={[
                {
                  value: 'dd.MM.yyyy',
                  label: copy.dateFormatOptions['dd.MM.yyyy'],
                },
                {
                  value: 'yyyy-MM-dd',
                  label: copy.dateFormatOptions['yyyy-MM-dd'],
                },
              ]}
            />
          </div>

          <SubmitButton
            isLoading={saving}
            loadingText={copy.loadingLabel}
            disableIfNoChanges
            icon={<Save className="h-4 w-4" aria-hidden="true" />}
          >
            {copy.submitLabel}
          </SubmitButton>
        </Form>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-muted font-mono text-2xs uppercase tracking-wider">
              {copy.themeLabel}
            </Label>
            <div
              role="radiogroup"
              aria-label={copy.themeLabel}
              className="grid grid-cols-3 gap-1.5"
            >
              {themeOptions.map(({ id, label, Icon }) => {
                const selected = activeTheme === id;
                return (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    role="radio"
                    aria-checked={selected}
                    variant={selected ? 'primary' : 'secondary'}
                    onClick={() => setTheme(id)}
                    className="min-h-[40px] justify-center gap-1.5 px-2 sm:min-h-0"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-2xs uppercase tracking-wider text-ash">
              {copy.languageLabel}
            </Label>
            <div
              role="group"
              aria-label={copy.languageLabel}
              className="grid grid-cols-2 gap-1.5"
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
        </div>
      </CardContent>
    </Card>
  );
}
