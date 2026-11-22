export const INVENTORY_UNIT_IDS = [
  'adet',
  'paket',
  'kutu',
  'şişe',
  'rulo',
  'kg',
  'gr',
  'lt',
  'ml',
  'm',
  'çift',
  'set',
] as const;

export type InventoryUnit = (typeof INVENTORY_UNIT_IDS)[number];

export interface InventoryUnitDefinition {
  id: InventoryUnit;
  label: string;
  shortLabel: string;
  defaultStep: number;
  stepPresets: readonly number[];
  allowDecimal: boolean;
}

export const INVENTORY_UNITS: Record<InventoryUnit, InventoryUnitDefinition> = {
  adet: {
    id: 'adet',
    label: 'Adet',
    shortLabel: 'adet',
    defaultStep: 1,
    stepPresets: [1, 2, 5, 10],
    allowDecimal: false,
  },
  paket: {
    id: 'paket',
    label: 'Paket',
    shortLabel: 'paket',
    defaultStep: 1,
    stepPresets: [1, 2, 5],
    allowDecimal: false,
  },
  kutu: {
    id: 'kutu',
    label: 'Kutu',
    shortLabel: 'kutu',
    defaultStep: 1,
    stepPresets: [1, 2, 5],
    allowDecimal: false,
  },
  şişe: {
    id: 'şişe',
    label: 'Şişe',
    shortLabel: 'şişe',
    defaultStep: 1,
    stepPresets: [1, 2, 6],
    allowDecimal: false,
  },
  rulo: {
    id: 'rulo',
    label: 'Rulo',
    shortLabel: 'rulo',
    defaultStep: 1,
    stepPresets: [1, 2, 4],
    allowDecimal: false,
  },
  kg: {
    id: 'kg',
    label: 'Kilogram (kg)',
    shortLabel: 'kg',
    defaultStep: 0.25,
    stepPresets: [0.1, 0.25, 0.5, 1],
    allowDecimal: true,
  },
  gr: {
    id: 'gr',
    label: 'Gram (gr)',
    shortLabel: 'gr',
    defaultStep: 50,
    stepPresets: [10, 25, 50, 100, 250],
    allowDecimal: false,
  },
  lt: {
    id: 'lt',
    label: 'Litre (lt)',
    shortLabel: 'lt',
    defaultStep: 0.25,
    stepPresets: [0.1, 0.25, 0.5, 1],
    allowDecimal: true,
  },
  ml: {
    id: 'ml',
    label: 'Mililitre (ml)',
    shortLabel: 'ml',
    defaultStep: 50,
    stepPresets: [25, 50, 100, 250],
    allowDecimal: false,
  },
  m: {
    id: 'm',
    label: 'Metre (m)',
    shortLabel: 'm',
    defaultStep: 0.5,
    stepPresets: [0.5, 1, 5],
    allowDecimal: true,
  },
  çift: {
    id: 'çift',
    label: 'Çift',
    shortLabel: 'çift',
    defaultStep: 1,
    stepPresets: [1, 2],
    allowDecimal: false,
  },
  set: {
    id: 'set',
    label: 'Set',
    shortLabel: 'set',
    defaultStep: 1,
    stepPresets: [1, 2],
    allowDecimal: false,
  },
};

export const UNIT_ALIASES: Record<string, InventoryUnit> = {
  adet: 'adet',
  pcs: 'adet',
  piece: 'adet',
  paket: 'paket',
  pkt: 'paket',
  kutu: 'kutu',
  şişe: 'şişe',
  sise: 'şişe',
  rulo: 'rulo',
  kg: 'kg',
  kilo: 'kg',
  kilogram: 'kg',
  gr: 'gr',
  g: 'gr',
  gram: 'gr',
  lt: 'lt',
  l: 'lt',
  litre: 'lt',
  liter: 'lt',
  ml: 'ml',
  mililitre: 'ml',
  m: 'm',
  metre: 'm',
  çift: 'çift',
  cift: 'çift',
  set: 'set',
};

export const INVENTORY_UNIT_OPTIONS = INVENTORY_UNIT_IDS.map((id) => ({
  value: id,
  label: INVENTORY_UNITS[id].label,
}));

export function normalizeInventoryUnit(raw?: string): InventoryUnit | string {
  const trimmed = raw?.trim();
  if (!trimmed) return 'adet';
  const lower = trimmed.toLocaleLowerCase('tr-TR');
  return UNIT_ALIASES[lower] ?? trimmed;
}

export function getUnitDefinition(rawUnit?: string): InventoryUnitDefinition {
  const normalized = normalizeInventoryUnit(rawUnit);
  if (normalized in INVENTORY_UNITS) {
    return INVENTORY_UNITS[normalized as InventoryUnit];
  }
  return {
    id: 'adet',
    label: rawUnit?.trim() || 'Adet',
    shortLabel: rawUnit?.trim() || 'adet',
    defaultStep: 1,
    stepPresets: [1, 2, 5],
    allowDecimal: true,
  };
}

export function roundQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function getEffectiveDecrementStep(
  rawUnit: string | undefined,
  currentQuantity: number,
  requestedStep?: number,
): number {
  if (currentQuantity <= 0) return 0;
  const baseStep = requestedStep ?? getUnitDefinition(rawUnit).defaultStep;
  return roundQuantity(Math.min(baseStep, currentQuantity));
}
