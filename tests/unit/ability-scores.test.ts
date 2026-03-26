import { describe, it, expect } from 'vitest';
import { computeFinalScores, computeModifiers } from '../../src/selectors/ability-scores.ts';
import type { Character } from '../../src/types/character.ts';

function makeTestCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test',
    status: 'active',
    name: 'Test',
    level: 1,
    speciesId: 'species-human',
    backgroundId: 'bg-soldier',
    classId: 'class-fighter',
    subclass: '',
    baseAbilityScores: { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 },
    backgroundAsi: { mode: 'three', abilities: ['strength', 'dexterity', 'constitution'] },
    hitPoints: { max: 13, current: 13, temp: 0 },
    deathSaves: { successes: 0, failures: 0 },
    skillProficiencies: ['athletics', 'intimidation'],
    skillExpertise: [],
    toolProficiencies: [],
    languages: ['Common'],
    armorProficiencies: [],
    weaponProficiencies: [],
    savingThrowProficiencies: ['strength', 'constitution'],
    featIds: [],
    weaponMasteries: [],
    spellsKnown: [],
    spellsPrepared: [],
    spellSlotsUsed: [],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    customActions: [],
    customFeatures: [],
    notes: { personalityTraits: '', ideals: '', bonds: '', flaws: '', backstory: '', freeform: '' },
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('computeFinalScores', () => {
  it('applies +1/+1/+1 background ASI', () => {
    const char = makeTestCharacter();
    const scores = computeFinalScores(char);
    expect(scores.strength).toBe(16); // 15 + 1
    expect(scores.dexterity).toBe(15); // 14 + 1
    expect(scores.constitution).toBe(14); // 13 + 1
    expect(scores.intelligence).toBe(12); // unchanged
  });

  it('applies +2/+1 background ASI', () => {
    const char = makeTestCharacter({
      backgroundAsi: { mode: 'two', plus2: 'strength', plus1: 'constitution' },
    });
    const scores = computeFinalScores(char);
    expect(scores.strength).toBe(17); // 15 + 2
    expect(scores.constitution).toBe(14); // 13 + 1
    expect(scores.dexterity).toBe(14); // unchanged
  });

  it('applies species ASI when present (homebrew)', () => {
    const char = makeTestCharacter({
      speciesAsi: { mode: 'two', plus2: 'wisdom', plus1: 'charisma' },
    });
    const scores = computeFinalScores(char);
    expect(scores.wisdom).toBe(12); // 10 + 1 (bg) doesn't apply to wisdom, so 10 + 2 = 12. Wait...
    // backgroundAsi is +1 to str/dex/con. speciesAsi is +2 wis, +1 cha
    expect(scores.wisdom).toBe(12); // 10 + 2
    expect(scores.charisma).toBe(9); // 8 + 1
  });

  it('caps scores at 20', () => {
    const char = makeTestCharacter({
      baseAbilityScores: { strength: 20, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      backgroundAsi: { mode: 'two', plus2: 'strength', plus1: 'dexterity' },
    });
    const scores = computeFinalScores(char);
    expect(scores.strength).toBe(20); // capped
    expect(scores.dexterity).toBe(11); // 10 + 1
  });
});

describe('computeModifiers', () => {
  it('returns correct modifiers for a score set', () => {
    const mods = computeModifiers({
      strength: 16, dexterity: 14, constitution: 12,
      intelligence: 10, wisdom: 8, charisma: 15,
    });
    expect(mods.strength).toBe(3);
    expect(mods.dexterity).toBe(2);
    expect(mods.constitution).toBe(1);
    expect(mods.intelligence).toBe(0);
    expect(mods.wisdom).toBe(-1);
    expect(mods.charisma).toBe(2);
  });
});
