import { describe, expect, it } from 'vitest';
import { compareOrder, DEFAULT_ORDER } from '~/lib/order';

describe('compareOrder', () => {
  it('sorts the lowest number first', () => {
    expect(compareOrder(1, 2)).toBeLessThan(0);
    expect(compareOrder(2, 1)).toBeGreaterThan(0);
    expect(compareOrder(3, 3)).toBe(0);
  });

  it('puts entries without an order last', () => {
    expect(compareOrder(undefined, 1)).toBeGreaterThan(0);
    expect(compareOrder(1, undefined)).toBeLessThan(0);
    expect(compareOrder(undefined, undefined)).toBe(0);
  });

  it('keeps a decimal order between its neighbours', () => {
    expect([...[2, 1.5, 1]].sort(compareOrder)).toEqual([1, 1.5, 2]);
  });

  it('still sorts an explicit order above the default', () => {
    expect(compareOrder(DEFAULT_ORDER - 1, undefined)).toBeLessThan(0);
  });
});
