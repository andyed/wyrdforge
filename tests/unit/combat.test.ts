import { describe, it, expect } from 'vitest';
import { computeAC, computeInitiative, computeSpellDC } from '../../src/selectors/combat.ts';
import type { AbilityScores } from '../../src/types/character.ts';

const scores: AbilityScores = {
  strength: 16, dexterity: 14, constitution: 12,
  intelligence: 18, wisdom: 10, charisma: 8,
};

describe('computeAC', () => {
  it('unarmored = 10 + dex mod', () => {
    expect(computeAC(scores)).toBe(12); // 10 + 2
  });

  it('light armor = base + full dex', () => {
    expect(computeAC(scores, 12, true)).toBe(14); // 12 + 2
  });

  it('medium armor = base + capped dex', () => {
    expect(computeAC(scores, 14, 2)).toBe(16); // 14 + 2 (dex is 2, cap is 2)
  });

  it('heavy armor = flat AC', () => {
    expect(computeAC(scores, 18, false)).toBe(18);
  });

  it('shield adds 2', () => {
    expect(computeAC(scores, undefined, undefined, true)).toBe(14); // 10 + 2 + 2
  });
});

describe('computeInitiative', () => {
  it('equals dex modifier', () => {
    expect(computeInitiative(scores)).toBe(2);
  });
});

describe('computeSpellDC', () => {
  it('8 + prof + ability mod', () => {
    expect(computeSpellDC(scores, 'intelligence', 2)).toBe(14); // 8 + 2 + 4
    expect(computeSpellDC(scores, 'wisdom', 3)).toBe(11); // 8 + 3 + 0
  });
});
