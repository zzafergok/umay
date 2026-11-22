'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Globe, Save } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { toast } from '@/components/core/toast';
import { Form, SelectField, SubmitButton } from '@/components/forms';
import { INVENTORY_UNIT_OPTIONS } from '@/features/inventory/constants';
import { useSettingsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import type { AuthSettingsCopy, SettingsSnapshot } from '../types';

const inventoryPreferencesFormSchema = z.object({
  currency: z.enum(['TRY', 'USD', 'EUR']),
  dateFormat: z.enum(['dd.MM.yyyy', 'yyyy-MM-dd']),
  defaultUnit: z.string().trim().min(1).max(24),
});

type InventoryPreferencesFormValues = z.infer<
  typeof inventoryPreferencesFormSchema
>;

interface InventoryRulesCardProps {
  initialSettings: SettingsSnapshot;
  onDraftChange?: (
    draft: Pick<SettingsSnapshot, 'currency' | 'dateFormat' | 'defaultUnit'>,
  ) => void;
  copy: AuthSettingsCopy['inventoryRules'];
}

export function InventoryRulesCard({
  initialSettings,
  onDraftChange,
  copy,
}: InventoryRulesCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: settingsData } = useSettingsQuery();
  const [saving, setSaving] = useState(false);

  const current = { ...initialSettings, ...settingsData };

  const methods = useForm<InventoryPreferencesFormValues>({
    resolver: zodResolver(inventoryPreferencesFormSchema),
    defaultValues: {
      currency: current.currency,
      dateFormat: current.dateFormat,
      defaultUnit: current.defaultUnit,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset({
      currency: current.currency,
      dateFormat: current.dateFormat,
      defaultUnit: current.defaultUnit,
    });
  }, [current.currency, current.dateFormat, current.defaultUnit, methods]);

  const watchedValues = useWatch({ control: methods.control });

  useEffect(() => {
    if (!onDraftChange) return;
    if (
      watchedValues.currency &&
      watchedValues.dateFormat &&
      watchedValues.defaultUnit
    ) {
      onDraftChange({
        currency: watchedValues.currency,
        dateFormat: watchedValues.dateFormat,
        defaultUnit: watchedValues.defaultUnit,
      });
    }
  }, [
    onDraftChange,
    watchedValues.currency,
    watchedValues.dateFormat,
    watchedValues.defaultUnit,
  ]);

  const handleSubmit = async (formData: InventoryPreferencesFormValues) => {
    setSaving(true);
    try {
      const updated = await inventoryService.updateSettings(formData);
      queryClient.setQueryData(['inventory', 'settings'], updated);
      methods.reset({
        currency: updated.currency,
        dateFormat: updated.dateFormat,
        defaultUnit: updated.defaultUnit ?? formData.defaultUnit,
      });
      toast.success(copy.successMessage);
      router.refresh();
    } catch {
      toast.error(copy.errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form<InventoryPreferencesFormValues>
          schema={inventoryPreferencesFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <SelectField
              name="defaultUnit"
              label={copy.defaultUnitLabel}
              options={INVENTORY_UNIT_OPTIONS.map((opt) => ({
                value: opt.value,
                label:
                  copy.unitOptions[
                    opt.value as keyof typeof copy.unitOptions
                  ] ?? opt.label,
              }))}
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
      </CardContent>
    </Card>
  );
}
