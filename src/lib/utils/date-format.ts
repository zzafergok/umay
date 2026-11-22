export type UserDateFormat = 'dd.MM.yyyy' | 'yyyy-MM-dd';

const ISTANBUL_TZ = 'Europe/Istanbul';

const PARTS_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: ISTANBUL_TZ,
});

export function formatUserDate(
  value: string | number | Date | null | undefined,
  dateFormat: UserDateFormat = 'dd.MM.yyyy',
  options?: { includeTime?: boolean; includeSeconds?: boolean },
): string {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '';
  }

  const parts = PARTS_FORMATTER.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const day = get('day');
  const month = get('month');
  const year = get('year');
  const dateStr =
    dateFormat === 'yyyy-MM-dd'
      ? `${year}-${month}-${day}`
      : `${day}.${month}.${year}`;

  if (!options?.includeTime) {
    return dateStr;
  }

  const hour = get('hour');
  const minute = get('minute');
  const second = get('second');
  const timeStr = options.includeSeconds
    ? `${hour}:${minute}:${second}`
    : `${hour}:${minute}`;
  return `${dateStr} ${timeStr}`;
}
