import { describe, it, expect } from 'vitest';
import { abilityModifier, proficiencyBonus } from '../../src/utils/modifiers.ts';

describe('abilityModifier', () => {
  it('returns correct modifiers for standard scores', () => {
    expect(abilityModifier(1)).toBe(-5);
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(11)).toBe(0);
    expect(abilityModifier(12)).toBe(1);
    expect(abilityModifier(14)).toBe(2);
    expect(abilityModifier(15)).toBe(2);
    expect(abilityModifier(18)).toBe(4);
    expect(abilityModifier(20)).toBe(5);
  });

  it('returns 0 for NaN', () => {
    expect(abilityModifier(NaN)).toBe(0);
  });
});

describe('proficiencyBonus', () => {
  it('returns correct bonuses by level', () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(8)).toBe(3);
    expect(proficiencyBonus(9)).toBe(4);
    expect(proficiencyBonus(12)).toBe(4);
    expect(proficiencyBonus(13)).toBe(5);
    expect(proficiencyBonus(16)).toBe(5);
    expect(proficiencyBonus(17)).toBe(6);
    expect(proficiencyBonus(20)).toBe(6);
  });

  it('returns 2 for invalid levels', () => {
    expect(proficiencyBonus(0)).toBe(2);
    expect(proficiencyBonus(-1)).toBe(2);
    expect(proficiencyBonus(NaN)).toBe(2);
  });
});
