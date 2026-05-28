import { describe, it, expect } from 'vitest';
import { pick, randomInt, randomDate } from '../../../src/utils/seedHelpers';

describe('pick', () => {
  it('returns an element that exists in the array', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(pick(arr));
    }
  });

  it('always returns the only element for a single-element array', () => {
    expect(pick([42])).toBe(42);
  });

  it('works with an array of objects', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = pick(arr);
    expect(arr).toContain(result);
  });
});

describe('randomInt', () => {
  it('always returns a value within [min, max]', () => {
    const min = 50_000;
    const max = 120_000;
    for (let i = 0; i < 200; i++) {
      const val = randomInt(min, max);
      expect(val).toBeGreaterThanOrEqual(min);
      expect(val).toBeLessThanOrEqual(max);
    }
  });

  it('always returns an integer', () => {
    for (let i = 0; i < 100; i++) {
      expect(Number.isInteger(randomInt(1, 1000))).toBe(true);
    }
  });

  it('returns exactly min when min === max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });
});

describe('randomDate', () => {
  it('always returns a Date within [start, end]', () => {
    const start = new Date('2015-01-01');
    const end = new Date('2025-12-31');
    for (let i = 0; i < 100; i++) {
      const result = randomDate(start, end);
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    }
  });

  it('returns a Date instance', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2023-12-31');
    expect(randomDate(start, end)).toBeInstanceOf(Date);
  });

  it('returns exactly start when start === end', () => {
    const date = new Date('2022-06-15');
    expect(randomDate(date, date).getTime()).toBe(date.getTime());
  });
});
