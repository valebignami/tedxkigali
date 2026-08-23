// dates.ts prints every event time on a 24-hour clock in Africa/Kigali, so a
// programme entry written as "9am" or "9.00" would sit next to those times
// looking inconsistent. This is the only check the build applies to the
// Programme field, so it has to catch both a single time and a range.
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const RANGE_SEPARATOR = /\s*[-–—]\s*/;

/** Matches "HH:MM" or "HH:MM-HH:MM" (en and em dash accepted too, spaces optional). */
export function isValidScheduleTime(value: string): boolean {
  const parts = value.split(RANGE_SEPARATOR);
  if (parts.length === 1) return TIME.test(parts[0]);
  if (parts.length === 2) return TIME.test(parts[0]) && TIME.test(parts[1]);
  return false;
}
