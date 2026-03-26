import type { AbilityScores } from '../types/character.ts';
import type { Weapon } from '../types/content.ts';
import type { Ability } from '../types/rules.ts';
import { abilityModifier } from '../utils/modifiers.ts';

/** Compute AC from armor + dex. Unarmored = 10 + dex mod. */
export function computeAC(
  finalScores: AbilityScores,
  armorAC?: number,
  dexBonus?: boolean | number,
  hasShield?: boolean
): number {
  const dexMod = abilityModifier(finalScores.dexterity);
  let ac: number;

  if (armorAC == null) {
    // Unarmored
    ac = 10 + dexMod;
  } else if (dexBonus === true) {
    // Light armor: full dex
    ac = armorAC + dexMod;
  } else if (typeof dexBonus === 'number') {
    // Medium armor: capped dex
    ac = armorAC + Math.min(dexMod, dexBonus);
  } else {
    // Heavy armor: no dex
    ac = armorAC;
  }

  if (hasShield) ac += 2;
  return ac;
}

/** Compute initiative modifier. */
export function computeInitiative(finalScores: AbilityScores): number {
  return abilityModifier(finalScores.dexterity);
}

/** Compute spell save DC = 8 + proficiency + spellcasting ability mod. */
export function computeSpellDC(
  finalScores: AbilityScores,
  spellcastingAbility: Ability,
  profBonus: number
): number {
  return 8 + profBonus + abilityModifier(finalScores[spellcastingAbility]);
}

/** Compute spell attack modifier. */
export function computeSpellAttack(
  finalScores: AbilityScores,
  spellcastingAbility: Ability,
  profBonus: number
): number {
  return profBonus + abilityModifier(finalScores[spellcastingAbility]);
}

/** Compute weapon attack modifier. Handles Finesse (uses higher of STR/DEX). */
export function computeWeaponAttackMod(
  weapon: Weapon,
  finalScores: AbilityScores,
  profBonus: number,
  weaponProficiencies: string[]
): number {
  const isFinesse = weapon.properties.some((p) => p.toLowerCase().includes('finesse'));
  const isRanged = weapon.range != null && !weapon.properties.some((p) => p.toLowerCase().includes('thrown'));

  let abilityMod: number;
  if (isFinesse) {
    abilityMod = Math.max(abilityModifier(finalScores.strength), abilityModifier(finalScores.dexterity));
  } else if (isRanged) {
    abilityMod = abilityModifier(finalScores.dexterity);
  } else {
    abilityMod = abilityModifier(finalScores.strength);
  }

  // Check proficiency — match against "Simple Weapons", "Martial Weapons", or specific weapon name
  const isProficient =
    weaponProficiencies.includes('Simple Weapons') && weapon.category === 'simple' ||
    weaponProficiencies.includes('Martial Weapons') && weapon.category === 'martial' ||
    weaponProficiencies.some((p) => p.toLowerCase() === weapon.name.toLowerCase());

  return abilityMod + (isProficient ? profBonus : 0);
}

/** Get the ability modifier used for weapon damage. */
export function computeWeaponDamageMod(
  weapon: Weapon,
  finalScores: AbilityScores,
): number {
  const isFinesse = weapon.properties.some((p) => p.toLowerCase().includes('finesse'));
  const isRanged = weapon.range != null && !weapon.properties.some((p) => p.toLowerCase().includes('thrown'));

  if (isFinesse) {
    return Math.max(abilityModifier(finalScores.strength), abilityModifier(finalScores.dexterity));
  } else if (isRanged) {
    return abilityModifier(finalScores.dexterity);
  }
  return abilityModifier(finalScores.strength);
}
