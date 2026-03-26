/** Convert an ability score to its modifier. */
export function abilityModifier(score: number): number {
  if (!isFinite(score)) return 0;
  return Math.floor((score - 10) / 2);
}

/** Proficiency bonus by character level (1-20). */
export function proficiencyBonus(level: number): number {
  if (!isFinite(level) || level < 1) return 2;
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}
