'use client';

import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Switch } from '@/components/core/switch';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import {
  ITEM_TYPE_OPTIONS,
  MIN_QUANTITY_TOOLTIP,
  UNIT_SUGGESTIONS,
} from '@/features/inventory/constants';
import type { CategoryDefaultItemConfig } from '@/features/inventory/types';
import { cn } from '@/lib/utils';

interface CategoryItemDefaultsPanelProps {
  value: CategoryDefaultItemConfig;
  onChange: (next: CategoryDefaultItemConfig) => void;
}

const TRACKING_TOGGLES: {
  key: keyof Pick<
    CategoryDefaultItemConfig,
    | 'trackBrandModel'
    | 'trackSerialNumber'
    | 'trackPurchase'
    | 'trackWarranty'
    | 'trackExpiry'
  >;
  label: string;
  description: string;
}[] = [
  {
    key: 'trackBrandModel',
    label: 'Marka & Model Bilgisi',
    description: 'Ürün eklerken marka ve model alanlarını öne çıkarır.',
  },
  {
    key: 'trackSerialNumber',
    label: 'Seri Numarası Takibi',
    description: 'Cihaz ve demirbaşlar için seri no girişi önerir.',
  },
  {
    key: 'trackPurchase',
    label: 'Satın Alma & Fiyat Takibi',
    description:
      'Satın alma tarihi, fiyat, para birimi ve mağaza alanlarını açar.',
  },
  {
    key: 'trackWarranty',
    label: 'Garanti Bitiş Tarihi',
    description: 'Garanti süresi takibi yapılan elektronik ve eşyalar için.',
  },
  {
    key: 'trackExpiry',
    label: 'Son Kullanma Tarihi (SKT)',
    description:
      'Gıda, ilaç ve ömürlü sarf malzemeler için SKT alanını vurgular.',
  },
];

export function CategoryItemDefaultsPanel({
  value,
  onChange,
}: CategoryItemDefaultsPanelProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-2xs uppercase tracking-wider text-ash">
          Varsayılan Ürün Türü
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ITEM_TYPE_OPTIONS.map((opt) => {
            const active = (value.defaultType ?? 'consumable') === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant="outline"
                onClick={() => onChange({ ...value, defaultType: opt.value })}
                className={cn(
                  'h-auto flex-col items-start gap-1 whitespace-normal p-3 text-left',
                  active && 'border-accent bg-accent-subtle/40',
                )}
              >
                <span className="text-xs font-semibold text-text">
                  {opt.label}
                </span>
                <span className="text-[11px] font-normal text-text-muted">
                  {opt.description}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cat-default-unit" className="text-xs">
            Varsayılan Birim
          </Label>
          <Input
            id="cat-default-unit"
            value={value.defaultUnit ?? ''}
            onChange={(e) =>
              onChange({ ...value, defaultUnit: e.target.value })
            }
            placeholder="Örn. adet, paket, lt"
            className="h-9 text-xs"
          />
          <div className="flex flex-wrap gap-1.5 sm:gap-1">
            {UNIT_SUGGESTIONS.map((unit) => (
              <Button
                key={unit}
                type="button"
                size="xs"
                variant={value.defaultUnit === unit ? 'default' : 'outline'}
                onClick={() => onChange({ ...value, defaultUnit: unit })}
                className="min-h-[36px] px-2.5 text-xs sm:h-6 sm:min-h-0 sm:px-2 sm:text-[11px]"
              >
                {unit}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="cat-default-min-qty" className="text-xs">
              Varsayılan Minimum Stok Eşiği
            </Label>
            <InfoTooltip
              content={MIN_QUANTITY_TOOLTIP}
              ariaLabel="Varsayılan minimum stok eşiği hakkında bilgi"
            />
          </div>
          <Input
            id="cat-default-min-qty"
            type="number"
            min={0}
            value={
              value.defaultMinQuantity !== undefined
                ? String(value.defaultMinQuantity)
                : ''
            }
            onChange={(e) => {
              const raw = e.target.value;
              onChange({
                ...value,
                defaultMinQuantity: raw === '' ? undefined : Number(raw),
              });
            }}
            placeholder="Örn. 1"
            className="h-9 text-xs"
          />
          <p className="text-[11px] text-text-muted">
            Bu kategoride yeni ürün oluştururken otomatik uygulanır.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-2xs uppercase tracking-wider text-ash">
          Ürün Formu Gelişmiş Takip Alanları
        </p>
        <div className="space-y-2">
          {TRACKING_TOGGLES.map((toggle) => {
            const checked = Boolean(value[toggle.key]);
            return (
              <div
                key={toggle.key}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken/40 px-3 py-2.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <Label
                    htmlFor={`track-${toggle.key}`}
                    className="cursor-pointer text-xs font-medium"
                  >
                    {toggle.label}
                  </Label>
                  <p className="text-[11px] text-text-muted">
                    {toggle.description}
                  </p>
                </div>
                <Switch
                  id={`track-${toggle.key}`}
                  checked={checked}
                  onCheckedChange={(next) =>
                    onChange({ ...value, [toggle.key]: next })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
