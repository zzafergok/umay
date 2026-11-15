import type { Part, PartLifespan, PartStatus } from '@/features/inventory/types';

export const ISTANBUL_TIMEZONE = 'Europe/Istanbul';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns YYYY-MM-DD in Europe/Istanbul timezone.
 */
export function getIstanbulDateKey(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Parses a date string into UTC midnight of its Europe/Istanbul calendar day.
 */
export function toIstanbulDayStartMs(dateInput: string | Date): number {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const key = getIstanbulDateKey(date);
  return Date.parse(`${key}T00:00:00.000Z`);
}

export function computeNextReplacementAt(
  installedAt: string,
  lifespan: PartLifespan,
): string | null {
  if (
    (lifespan.mode === 'time' || lifespan.mode === 'both') &&
    typeof lifespan.days === 'number' &&
    lifespan.days > 0
  ) {
    const startMs = toIstanbulDayStartMs(installedAt);
    const nextMs = startMs + lifespan.days * MS_PER_DAY;
    return new Date(nextMs).toISOString();
  }
  return null;
}

export interface PartHealth {
  status: PartStatus;
  remainingPercent: number;
  daysRemaining: number | null;
  usageRemaining: number | null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computePartHealth(
  part: Pick<
    Part,
    'lifespan' | 'installedAt' | 'nextReplacementAt' | 'usageCurrent' | 'reminderLeadDays'
  >,
  now: Date = new Date(),
): PartHealth {
  const { lifespan, nextReplacementAt, usageCurrent = 0, reminderLeadDays } = part;

  let timePercent: number | null = null;
  let daysRemaining: number | null = null;
  let timeStatus: PartStatus = 'ok';

  if (
    (lifespan.mode === 'time' || lifespan.mode === 'both') &&
    typeof lifespan.days === 'number' &&
    lifespan.days > 0
  ) {
    const targetIso =
      nextReplacementAt ?? computeNextReplacementAt(part.installedAt, lifespan);
    if (targetIso) {
      const nowDayMs = toIstanbulDayStartMs(now);
      const targetDayMs = toIstanbulDayStartMs(targetIso);
      daysRemaining = Math.ceil((targetDayMs - nowDayMs) / MS_PER_DAY);
      timePercent = clampPercent((daysRemaining / lifespan.days) * 100);

      if (daysRemaining <= 0) {
        timeStatus = 'overdue';
      } else if (daysRemaining <= reminderLeadDays) {
        timeStatus = 'due_soon';
      }
    }
  }

  let usagePercent: number | null = null;
  let usageRemaining: number | null = null;
  let usageStatus: PartStatus = 'ok';

  if (
    (lifespan.mode === 'usage' || lifespan.mode === 'both') &&
    typeof lifespan.usageLimit === 'number' &&
    lifespan.usageLimit > 0
  ) {
    usageRemaining = Math.max(0, lifespan.usageLimit - usageCurrent);
    usagePercent = clampPercent((usageRemaining / lifespan.usageLimit) * 100);

    if (usageRemaining <= 0) {
      usageStatus = 'overdue';
    } else if (usagePercent <= 15) {
      usageStatus = 'due_soon';
    }
  }

  const statusRank: Record<PartStatus, number> = {
    ok: 0,
    due_soon: 1,
    overdue: 2,
  };

  const finalStatus: PartStatus =
    statusRank[timeStatus] >= statusRank[usageStatus] ? timeStatus : usageStatus;

  const percents = [timePercent, usagePercent].filter(
    (v): v is number => v !== null,
  );
  const remainingPercent = percents.length > 0 ? Math.min(...percents) : 100;

  return {
    status: finalStatus,
    remainingPercent,
    daysRemaining,
    usageRemaining,
  };
}
