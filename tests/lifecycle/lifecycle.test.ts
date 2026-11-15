import { describe, expect, it } from 'vitest';
import {
  computeNextReplacementAt,
  computePartHealth,
  getIstanbulDateKey,
} from '@/lib/lifecycle';

describe('lifecycle calculations (Europe/Istanbul)', () => {
  it('formats Istanbul calendar day correctly across UTC midnight', () => {
    // 2026-05-10 22:00 UTC is 2026-05-11 01:00 in Europe/Istanbul (UTC+3)
    const date = new Date('2026-05-10T22:00:00.000Z');
    expect(getIstanbulDateKey(date)).toBe('2026-05-11');
  });

  it('computes nextReplacementAt for time-based parts', () => {
    const next = computeNextReplacementAt('2026-01-01T10:00:00.000Z', {
      mode: 'time',
      days: 180,
    });
    expect(next).toBe('2026-06-30T00:00:00.000Z');
  });

  it('returns null nextReplacementAt for usage-only parts', () => {
    const next = computeNextReplacementAt('2026-01-01T10:00:00.000Z', {
      mode: 'usage',
      usageUnit: 'sayfa',
      usageLimit: 1000,
    });
    expect(next).toBeNull();
  });

  it('classifies ok, due_soon on boundary day, and overdue on day 0', () => {
    const basePart = {
      lifespan: { mode: 'time' as const, days: 30 },
      installedAt: '2026-05-01T00:00:00.000Z',
      nextReplacementAt: '2026-05-31T00:00:00.000Z',
    };

    const okHealth = computePartHealth(
      basePart,
      new Date('2026-05-20T12:00:00.000Z'),
    );
    expect(okHealth.status).toBe('ok');
    expect(okHealth.daysRemaining).toBe(11);

    const dueSoonBoundary = computePartHealth(
      basePart,
      new Date('2026-05-24T12:00:00.000Z'),
    );
    expect(dueSoonBoundary.status).toBe('due_soon');
    expect(dueSoonBoundary.daysRemaining).toBe(7);

    const overdueBoundary = computePartHealth(
      basePart,
      new Date('2026-05-31T00:00:00.000Z'),
    );
    expect(overdueBoundary.status).toBe('overdue');
    expect(overdueBoundary.daysRemaining).toBe(0);
  });

  it('uses earliest threshold when lifespan mode is both', () => {
    const health = computePartHealth(
      {
        lifespan: {
          mode: 'both',
          days: 180,
          usageUnit: 'litre',
          usageLimit: 1000,
        },
        installedAt: '2026-05-01T00:00:00.000Z',
        nextReplacementAt: '2026-10-28T00:00:00.000Z',
        usageCurrent: 920,
      },
      new Date('2026-05-15T10:00:00.000Z'),
    );

    expect(health.status).toBe('due_soon');
    expect(health.remainingPercent).toBe(8);
    expect(health.usageRemaining).toBe(80);
  });
});
