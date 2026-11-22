import { describe, expect, it } from 'vitest';
import {
  createEquipment,
  createPart,
  deleteEquipment,
  listEquipment,
  listItems,
  replacePart,
  updateEquipment,
} from '@/lib/inventory/repo';

describe('equipment collection separation', () => {
  it('stores devices and spares in equipment collection isolated from kitchen items', async () => {
    const uid = `test-eq-${Date.now()}`;

    const device = await createEquipment(uid, {
      kind: 'device',
      name: 'Dikey Süpürge',
      status: 'active',
      quantity: 1,
      unit: 'adet',
      brand: 'Dyson',
      model: 'V10',
    });
    const spare = await createEquipment(uid, {
      kind: 'spare',
      name: 'HEPA Filtre',
      status: 'active',
      quantity: 2,
      unit: 'adet',
    });

    expect(device.kind).toBe('device');
    expect(spare.kind).toBe('spare');
    expect(await listEquipment(uid)).toHaveLength(2);
    expect(await listItems(uid)).toHaveLength(0);

    const updatedSpare = await updateEquipment(uid, spare.id, { quantity: 3 });
    expect(updatedSpare.quantity).toBe(3);

    const part = await createPart(uid, {
      name: 'Ana HEPA Filtre',
      parentItemId: device.id,
      spareItemId: spare.id,
      lifespan: { mode: 'time', days: 180 },
      installedAt: new Date().toISOString(),
      usageCurrent: 0,
      notes: '',
    });

    const replaced = await replacePart(uid, part.id, {
      deductSpare: true,
    });
    expect(replaced.spareDeducted).toBe(true);

    const afterReplace = await listEquipment(uid);
    expect(afterReplace.find((e) => e.id === spare.id)?.quantity).toBe(2);

    await deleteEquipment(uid, device.id);
    expect(await listEquipment(uid)).toHaveLength(1);
  });
});
