import { describe, expect, it } from 'vitest';
import {
  getEffectiveDecrementStep,
  getUnitDefinition,
  INVENTORY_UNIT_IDS,
  INVENTORY_UNITS,
  normalizeInventoryUnit,
  roundQuantity,
} from '@/features/inventory/constants';

describe('inventory unit enum and unit-specific stock steps', () => {
  it('defines metadata and step presets for every unit in the enum', () => {
    for (const id of INVENTORY_UNIT_IDS) {
      expect(INVENTORY_UNITS[id].id).toBe(id);
      expect(INVENTORY_UNITS[id].defaultStep).toBeGreaterThan(0);
      expect(INVENTORY_UNITS[id].stepPresets.length).toBeGreaterThan(0);
    }
  });

  it('normalizes common unit aliases to canonical enum keys', () => {
    expect(normalizeInventoryUnit('g')).toBe('gr');
    expect(normalizeInventoryUnit('Gram')).toBe('gr');
    expect(normalizeInventoryUnit('Kilogram')).toBe('kg');
    expect(normalizeInventoryUnit('l')).toBe('lt');
  });

  it('computes unit-specific default steps and clamps decrement to remaining stock', () => {
    expect(getUnitDefinition('kg').defaultStep).toBe(0.25);
    expect(getUnitDefinition('gr').defaultStep).toBe(50);
    expect(getUnitDefinition('adet').defaultStep).toBe(1);

    expect(getEffectiveDecrementStep('kg', 1.5)).toBe(0.25);
    expect(getEffectiveDecrementStep('kg', 0.15)).toBe(0.15);
    expect(getEffectiveDecrementStep('gr', 30)).toBe(30);
    expect(getEffectiveDecrementStep('adet', 0)).toBe(0);
    expect(roundQuantity(0.5 - 0.25)).toBe(0.25);
  });
});
