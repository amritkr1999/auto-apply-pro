/**
 * Safely parses ISO date strings from backend.
 * Backend stores and returns dates in UTC (sometimes without trailing 'Z' in JSON).
 * If no timezone offset is present in the string, appends 'Z' to parse as UTC.
 */
export const parseUtcDate = (dateInput: string | number | Date | null | undefined): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);
  
  const str = String(dateInput).trim();
  if (!str) return null;

  // If ISO string without timezone designator (no 'Z' and no +HH:MM / -HH:MM offset), append 'Z'
  let formattedStr = str;
  if (!str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    formattedStr = str + 'Z';
  }

  const d = new Date(formattedStr);
  return isNaN(d.getTime()) ? new Date(str) : d;
};

/**
 * Formats a date using either a specified IANA timezone (e.g. "Asia/Kolkata", "America/New_York")
 * or falls back to the user's browser local timezone.
 */
export const formatDateInTimezone = (
  dateInput: Date | string | number | null | undefined,
  targetTimezone?: string
): string => {
  if (!dateInput) return '';
  const d = parseUtcDate(dateInput);
  if (!d || isNaN(d.getTime())) return '';

  if (targetTimezone && targetTimezone.trim()) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: targetTimezone.trim(),
      }).format(d);
    } catch (e) {
      console.warn("Invalid target timezone supplied to formatDateInTimezone:", targetTimezone);
    }
  }

  return d.toLocaleString();
};
