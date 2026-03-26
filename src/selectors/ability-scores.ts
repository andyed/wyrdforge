import type { Character, AbilityScores } from '../types/character.ts';
import type { AsiChoice } from '../types/content.ts';
import type { Ability } from '../types/rules.ts';
import { ABILITIES } from '../types/rules.ts';
import { abilityModifier } from '../utils/modifiers.ts';

function applyAsi(scores: AbilityScores, asi: AsiChoice): AbilityScores {
  const result = { ...scores };
  if (asi.mode === 'two') {
    result[asi.plus2] += 2;
    result[asi.plus1] += 1;
  } else {
    for (const ability of asi.abilities) {
      result[ability] += 1;
    }
  }
  return result;
}

/** Compute final ability scores after all bonuses. */
export function computeFinalScores(character: Character): AbilityScores {
  let scores = { ...character.baseAbilityScores };
  scores = applyAsi(scores, character.backgroundAsi);
  if (character.speciesAsi) {
    scores = applyAsi(scores, character.speciesAsi);
  }
  // Cap at 20 (standard rule)
  for (const ability of ABILITIES) {
    scores[ability] = Math.min(scores[ability], 20);
  }
  return scores;
}

/** Compute all ability modifiers from final scores. */
export function computeModifiers(finalScores: AbilityScores): Record<Ability, number> {
  const mods = {} as Record<Ability, number>;
  for (const ability of ABILITIES) {
    mods[ability] = abilityModifier(finalScores[ability]);
  }
  return mods;
}
