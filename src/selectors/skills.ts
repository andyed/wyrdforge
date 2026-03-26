import type { AbilityScores } from '../types/character.ts';
import type { Skill } from '../types/rules.ts';
import { SKILLS, SKILL_ABILITY } from '../types/rules.ts';
import { abilityModifier } from '../utils/modifiers.ts';

export interface SkillModifier {
  skill: Skill;
  modifier: number;
  proficient: boolean;
  expert: boolean;
}

/** Compute all skill modifiers. */
export function computeSkillModifiers(
  finalScores: AbilityScores,
  profBonus: number,
  proficiencies: Skill[],
  expertise: Skill[]
): SkillModifier[] {
  return SKILLS.map((skill) => {
    const ability = SKILL_ABILITY[skill];
    const baseMod = abilityModifier(finalScores[ability]);
    const proficient = proficiencies.includes(skill);
    const expert = expertise.includes(skill);

    let modifier = baseMod;
    if (expert) {
      modifier += profBonus * 2;
    } else if (proficient) {
      modifier += profBonus;
    }

    return { skill, modifier, proficient, expert };
  });
}
