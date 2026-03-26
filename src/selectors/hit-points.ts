import type { AbilityScores } from '../types/character.ts';
import { abilityModifier } from '../utils/modifiers.ts';
import { dieAverage } from '../utils/dice.ts';

/** Compute max HP at level 1: full hit die + con modifier. */
export function computeMaxHP(
  hitDie: number,
  level: number,
  finalScores: AbilityScores
): number {
  const conMod = abilityModifier(finalScores.constitution);
  if (level <= 0) return hitDie + conMod;

  // Level 1: full hit die. Levels 2+: average roll per level.
  const hpLevel1 = hitDie + conMod;
  const hpPerLevel = Math.floor(dieAverage(hitDie)) + conMod;
  const total = hpLevel1 + hpPerLevel * (level - 1);
  return Math.max(total, 1); // minimum 1 HP
}
