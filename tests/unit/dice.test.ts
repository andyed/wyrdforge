import { describe, it, expect } from 'vitest';
import { parseDiceNotation, parseDiceExpression, rollDie, rollDice, formatModifier } from '../../src/utils/dice.ts';

describe('parseDiceNotation', () => {
  it('parses valid notation', () => {
    expect(parseDiceNotation('2d6')).toEqual({ count: 2, sides: 6 });
    expect(parseDiceNotation('1d20')).toEqual({ count: 1, sides: 20 });
    expect(parseDiceNotation('4d8')).toEqual({ count: 4, sides: 8 });
    expect(parseDiceNotation('1D12')).toEqual({ count: 1, sides: 12 }); // case insensitive
  });

  it('returns null for invalid notation', () => {
    expect(parseDiceNotation('')).toBeNull();
    expect(parseDiceNotation('d6')).toBeNull();
    expect(parseDiceNotation('2d')).toBeNull();
    expect(parseDiceNotation('abc')).toBeNull();
    expect(parseDiceNotation('0d6')).toBeNull();
    expect(parseDiceNotation('2d0')).toBeNull();
  });

  it('handles whitespace', () => {
    expect(parseDiceNotation(' 2d6 ')).toEqual({ count: 2, sides: 6 });
  });
});

describe('parseDiceExpression', () => {
  it('parses dice + modifier', () => {
    expect(parseDiceExpression('2d6+3')).toEqual({
      dice: [{ count: 2, sides: 6 }],
      modifier: 3,
    });
  });

  it('parses dice only', () => {
    expect(parseDiceExpression('1d20')).toEqual({
      dice: [{ count: 1, sides: 20 }],
      modifier: 0,
    });
  });

  it('parses multiple dice groups', () => {
    const result = parseDiceExpression('1d20+1d4+5');
    expect(result?.dice).toEqual([
      { count: 1, sides: 20 },
      { count: 1, sides: 4 },
    ]);
    expect(result?.modifier).toBe(5);
  });

  it('returns null for empty/invalid', () => {
    expect(parseDiceExpression('')).toBeNull();
    expect(parseDiceExpression('abc')).toBeNull();
  });
});

describe('rollDie', () => {
  it('returns values within range', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(20);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('returns 1 for invalid sides', () => {
    expect(rollDie(0)).toBe(1);
    expect(rollDie(-1)).toBe(1);
    expect(rollDie(NaN)).toBe(1);
  });

  it('returns 1 for d1', () => {
    expect(rollDie(1)).toBe(1);
  });
});

describe('rollDice', () => {
  it('returns correct number of results', () => {
    const results = rollDice([{ count: 3, sides: 6 }, { count: 2, sides: 8 }]);
    expect(results).toHaveLength(5);
    expect(results.filter((d) => d.sides === 6)).toHaveLength(3);
    expect(results.filter((d) => d.sides === 8)).toHaveLength(2);
  });

  it('all values are within range', () => {
    const results = rollDice([{ count: 10, sides: 20 }]);
    for (const r of results) {
      expect(r.value).toBeGreaterThanOrEqual(1);
      expect(r.value).toBeLessThanOrEqual(20);
    }
  });
});
