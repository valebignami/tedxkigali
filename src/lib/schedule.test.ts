import { describe, expect, it } from 'vitest';
import { isValidScheduleTime } from '~/lib/schedule';

describe('isValidScheduleTime', () => {
  it.each([
    '09:00',
    '23:59',
    '00:00',
    '09:00-09:20',
    '09:00 - 09:20',
    '09:00-09:20'.replace('-', '–'), // en dash
    '09:00 – 09:20',
  ])('accepts %s', (input) => {
    expect(isValidScheduleTime(input)).toBe(true);
  });

  it.each([
    '',
    '25:00',
    '09:70',
    '9am',
    '9.00',
    '9:00',
    '09:00-25:00',
    '09:00 to 09:20',
    'not a time',
  ])('rejects %s', (input) => {
    expect(isValidScheduleTime(input)).toBe(false);
  });
});
