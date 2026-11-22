'use client';

import * as React from 'react';
import type { CurrencyCode } from '@/features/inventory/types';
import { useSettingsQuery } from '@/hooks/use-inventory-hooks';
import { formatCurrency } from '@/lib/utils';
import {
  formatUserDate,
  type UserDateFormat,
} from '@/lib/utils/date-format';

export function useUserPreferences() {
  const { data: settings } = useSettingsQuery();

  const currency: CurrencyCode = settings?.currency ?? 'TRY';
  const dateFormat: UserDateFormat = settings?.dateFormat ?? 'dd.MM.yyyy';
  const defaultUnit: string = settings?.defaultUnit ?? 'adet';
  const compactMode: boolean = settings?.compactMode ?? false;

  const formatDate = React.useCallback(
    (value: string | number | Date | null | undefined) =>
      formatUserDate(value, dateFormat),
    [dateFormat],
  );

  const formatDateTime = React.useCallback(
    (
      value: string | number | Date | null | undefined,
      includeSeconds = true,
    ) => formatUserDate(value, dateFormat, { includeTime: true, includeSeconds }),
    [dateFormat],
  );

  const formatPrice = React.useCallback(
    (amount: number, overrideCurrency?: CurrencyCode) =>
      formatCurrency(amount, {
        currency: overrideCurrency ?? currency,
        locale: 'tr',
      }),
    [currency],
  );

  return {
    currency,
    dateFormat,
    defaultUnit,
    compactMode,
    formatDate,
    formatDateTime,
    formatPrice,
  };
}
