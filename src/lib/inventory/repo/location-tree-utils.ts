import type { Location } from '@/features/inventory/types';
import { omitUndefinedDeep } from './utils';

export function collectDescendantLocationIds(
  all: Location[],
  rootId: string,
): Set<string> {
  const descendants = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const loc of all) {
      if (loc.parentId === currentId && !descendants.has(loc.id)) {
        descendants.add(loc.id);
        queue.push(loc.id);
      }
    }
  }
  return descendants;
}

export function buildDescendantLocationUpdates(
  all: Location[],
  root: Location,
  now: string,
): Location[] {
  const byParent = new Map<string, Location[]>();
  for (const loc of all) {
    if (!loc.parentId) continue;
    const list = byParent.get(loc.parentId) ?? [];
    list.push(loc);
    byParent.set(loc.parentId, list);
  }

  const updates: Location[] = [];
  const queue: Location[] = [root];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    const children = byParent.get(parent.id) ?? [];
    for (const child of children) {
      const nextChild = omitUndefinedDeep<Location>({
        ...child,
        path: [...parent.path, child.name],
        updatedAt: now,
      });
      updates.push(nextChild);
      queue.push(nextChild);
    }
  }
  return updates;
}
